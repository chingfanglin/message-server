
const config = require('../config/config');
var pg = require('pg');
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const uuidv4 = require('uuid/v4');

const connectionString = config.CONSTRING;

if (!connectionString)
  throw new Error('must set DATABASE_URL environment var');

// db配置
var connection = {
  user: "postgres",
  database: "postgres",
  password: "123456",
  port: 5432,
  // 擴展
  max: 20, // 最大連接
  idleTimeoutMillis: 3000, // 連接最大空閒時間 3s
}

var pool = new pg.Pool(connection);

//var Client = new pg.Client(connectionString)
// callback is called with (err, client, done)
function connect(callback) {
  return pool.connect(callback);
}

function query(query, params, callback) {
  //third parameter is optional
  if (typeof params == 'function') {
    callback = params;
    params = [];
  }

  doIt();
  function doIt() {
    connect(function (err, client, done) {
      if (err) return callback(err);

      client.query(query, params, function (err, result) {
        client.end();
        if (err) {
          if (err.code === '40P01') {
            console.error('[INTERNAL] Warning: Retrying deadlocked transaction: ', query, params);
            return doIt();
          }
          return callback(err)
        }
        callback(null, result)
      })
    })
  }
}

exports.query = query;

function getClient(runner, callback) {
  doIt();

  function doIt() {
    connect(function (err, client, done) {
      if (err) return callback(err);

      function rollback(err) {
        client.query('ROLLBACK', done);

        if (err.code === '40P01') {
          console.error('[INTERNAL_ERROR] Warning: Retrying deadlocked transaction..');
          return doIt();
        }

        callback(err);
      }
      client.query('BEGIN', function (err) {
        if (err)
          return rollback(err);

        runner(client, function (err, data) {
          if (err)
            return rollback(err);

          client.query('COMMIT', function (err) {
            if (err)
              return rollback(err);

            done();
            callback(null, data);
          });
        });
      });
    });
  }
}

exports.createUser = function (username, password, email, callback) {
  getClient(
    function (client, callback) {
      var hashedPassword = passwordHash.generate(password);

      client.query('SELECT COUNT(*) count FROM users WHERE lower(username) = lower($1)', [username],
        function (err, data) {
          if (err) return callback(err);

          if (data.rows[0].count > 0)
            return callback('USERNAME_TAKEN');

          client.query('INSERT INTO users(username, password, email) VALUES($1, $2, $3) RETURNING id',
            [username, hashedPassword, email],
            function (err, data) {
              if (err) {

                if (err.code === '23505')
                  return callback('USERNAME_TAKEN');
                else
                  return callback(err);
              }

              var userid = data.rows[0];
              callback(err, userid);
            }
          )
        })
    }
    , callback);
};

exports.login = function (username, password, callback) {
  getClient(
    function (client, callback) {

      client.query('SELECT id, password, mfa_secret, status FROM users WHERE lower(username) = lower($1)', [username], function (err, data) {
        if (err) return callback(err);
        if (!data.rows)
          return callback('NO_USER');

        var user = data.rows[0];
        var verified = passwordHash.verify(password, user.password);

        if (!verified)
          return callback('WRONG_PASSWORD', user.id);

        const secret = speakeasy.generateSecret();
        const token = jwt.sign({
          name: user.username
        }, secret.base32, {
            expiresIn: '1d' //秒到期时间
          })

        client.query('UPDATE users SET mfa_secret = $1 WHERE id = $2', [secret.base32, user.id], function (err, data) {
          callback(null, token)
        })
      })
    }
    , callback)
};

exports.getUserById = function (username, callback) {
  getClient(
    function (client, callback) {
      client.query('SELECT id, username FROM users WHERE lower(username) = lower($1) AND status = true', [username], function (err, data) {
        if (err) return callback(err);
        if (!data.rows)
          return callback('NO_USER');

        var user = data.rows[0];
        return callback(null, user)
      })
    }
    , callback)
};

exports.joinChannel = function (channelName, users, callback) {
  getClient(
    function (client, callback) {

      //搜尋所有頻道
      //SELECT id FROM channel WHERE '13' = ANY(users::int[]);

      client.query("SELECT id FROM channel WHERE users = $1", [users], function (err, data) {
        if (data.rows.length > 0) {
          var channel = data.rows[0];
          return callback(null, channel.id)
        }

        const uuid = uuidv4()
        client.query('INSERT INTO channel(id, name, users) VALUES($1, $2, $3) RETURNING id', [uuid, channelName, users], function (err, data) {
          if (err) return callback(err);
          console.log(uuid)
          return callback(null, uuid)
        })
      })
    }
    , callback)
};

exports.sendMessage = function (user_id, token, channel, message, callback) {
  getClient(
    function (client, callback) {

      client.query("SELECT mfa_secret FROM users WHERE id = $1 AND status = true", [user_id], function (err, data) {

        if (err) return callback(err);
        if (data.rows.length === 0)
          return callback('NO_USER');

        var user = data.rows[0];

        try {
          var decoded = jwt.verify(token, user.mfa_secret);
          client.query('INSERT INTO chat_messages(user_id, message, channel) VALUES($1, $2, $3) RETURNING id', [user_id, message, channel], function (err, data) {
            if (err) return callback(err);
            console.log(data)
            return callback(null, data)
          })
        } catch (err) {
          return callback(err)
        }
      })
    }
    , callback)
};

// Friends
exports.addFriends = function (from_user_id, to_user_id, token, callback) {
  getClient(
    function (client, callback) {

      client.query("SELECT mfa_secret FROM users WHERE id = $1 AND status = true", [from_user_id], function (err, data) {

        if (err) return callback(err);


        if (data.rows.length === 0)
          return callback('NO_FROM_USER');

        var user = data.rows[0];
        console.log(token, user.mfa_secret)
        try {
          var decoded = jwt.verify(token, user.mfa_secret);

          client.query('SELECT username FROM users WHERE id = $1 AND status = true', [to_user_id], function (err, data) {
            if (err) return callback(err);

            if (data.rows.length === 0)
              return callback('NO_TO_USER');

            const uuid = uuidv4()
            client.query('INSERT INTO friends(id, from_user_id, to_user_id) VALUES($1, $2, $3) RETURNING id', [uuid, from_user_id, to_user_id], function (err, data) {
              if (err) return callback(err);

              return callback(null, data)
            })
          })
        } catch (err) {
          return callback(err)
        }
      })
    }
    , callback)
};

exports.delFriends = function (from_user_id, to_user_id, token, callback) {
  getClient(
    function (client, callback) {

      client.query("SELECT mfa_secret FROM users WHERE id = $1 AND status = true", [from_user_id], function (err, data) {

        if (err) return callback(err);


        if (data.rows.length === 0)
          return callback('NO_USER');

        var user = data.rows[0];
        console.log(token, user.mfa_secret)
        try {
          var decoded = jwt.verify(token, user.mfa_secret);

          client.query('DELETE FROM friends WHERE from_user_id = $1 AND to_user_id = $2 RETURNING *', [from_user_id, to_user_id], function (err, data) {
            if (err) return callback(err);

            return callback(null, data)
          })
        } catch (err) {
          return callback(err)
        }
      })
    }
    , callback)
};


exports.agreeFriends = function (user_id, friends_id, token, callback) {
  getClient(
    function (client, callback) {

      client.query("SELECT mfa_secret FROM users WHERE id = $1 AND status = true", [user_id], function (err, data) {

        if (err) return callback(err);


        if (data.rows.length === 0)
          return callback('NO_USER');

        var user = data.rows[0];
        console.log(token, user.mfa_secret)
        try {
          var decoded = jwt.verify(token, user.mfa_secret);

          client.query('UPDATE friends SET is_agree = $1 WHERE id = $2 RETURNING from_user_id', [true, friends_id], function (err, data) {
            if (err) return callback(err);
            const uuid = uuidv4()
            var friends = data.rows[0];

            client.query('INSERT INTO friends(id, from_user_id, to_user_id, is_agree) VALUES($1, $2, $3, $4) RETURNING id', [uuid, user_id, friends.from_user_id, true], function (err, data) {
              if (err) return callback(err);
              return callback(null, data)
            })
          })
        } catch (err) {
          return callback(err)
        }
      })
    }
    , callback)
};

exports.blockFriends = function (user_id, friends_id, token, callback) {
  getClient(
    function (client, callback) {

      client.query("SELECT mfa_secret FROM users WHERE id = $1 AND status = true", [user_id], function (err, data) {

        if (err) return callback(err);


        if (data.rows.length === 0)
          return callback('NO_USER');

        var user = data.rows[0];
        console.log(token, user.mfa_secret)
        try {
          var decoded = jwt.verify(token, user.mfa_secret);

          client.query('UPDATE friends SET is_block = $1 WHERE id = $2 RETURNING from_user_id', [true, friends_id], function (err, data) {
            if (err) return callback(err);

            return callback(null, data);
          })
        } catch (err) {
          return callback(err)
        }
      })
    }
    , callback)
};




