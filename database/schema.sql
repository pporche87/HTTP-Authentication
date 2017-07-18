-- DROP DATABASE IF EXISTS http_auth;
-- CREATE DATABASE http_auth;
--
-- \c http_auth;

CREATE TABLE users (
 	id SERIAL PRIMARY KEY,
	email VARCHAR(50) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL
);
