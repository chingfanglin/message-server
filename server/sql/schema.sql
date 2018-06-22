
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users

CREATE TYPE UserClassEnum AS ENUM ('user', 'moderator', 'admin');

CREATE TABLE users (
    id bigint NOT NULL,
    created timestamp with time zone DEFAULT now() NOT NULL,
    username text NOT NULL,
    email text,
    password text NOT NULL,
    mfa_secret text,
    userclass UserClassEnum DEFAULT 'user' NOT NULL,
	status boolean DEFAULT true NOT NULL
);

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX unique_username ON users USING btree (lower(username));
CREATE INDEX users_email_idx ON users USING btree (lower(email));
CREATE INDEX user_id_idx ON users USING btree (id);

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE users_id_seq OWNED BY users.id;

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);

-- Friends 
CREATE TABLE friends (
  id uuid NOT NULL PRIMARY KEY,
  from_user_id bigint NOT NULL REFERENCES users(id),
  to_user_id bigint NOT NULL  REFERENCES users(id),
  created timestamp with time zone DEFAULT now() NOT NULL,
  is_block boolean NOT NULL DEFAULT false,
  is_agree boolean NOT NULL DEFAULT false
);

CREATE INDEX transfer_from_user_id_idx ON friends USING btree (from_user_id, created);
CREATE INDEX transfer_to_user_id_idx ON friends USING btree (to_user_id, created);



-- Channel 
CREATE TABLE channel (
  id uuid NOT NULL PRIMARY KEY,
  name text NOT NULL,
  users text [] NOT NULL,
  created timestamp with time zone DEFAULT now() NOT NULL
);

-- Chat messages

CREATE TABLE chat_messages
(
  id bigserial NOT NULL PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id),
  message text NOT NULL,
  created timestamp with time zone DEFAULT now() NOT NULL,
  is_bot boolean  NOT NULL DEFAULT false,
  channel text NOT NULL
);

CREATE INDEX chat_messages_user_id_idx ON chat_messages USING btree(user_id);
CREATE INDEX chat_messages_channel_id_idx ON chat_messages USING btree(channel, id);