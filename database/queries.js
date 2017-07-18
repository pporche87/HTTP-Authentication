const promise = require('bluebird')

const options = { promiseLib: promise }

const pgp = require('pg-promise')(options)
const connectionString = 'postgres://localhost:5432/http_auth'
const db = pgp(connectionString)

const insertUser = (email, password) => {
	return db.one('INSERT INTO users (email, password) VALUES ($1,$2) RETURNING email', [email, password])
}

const checkUserPassword = (email) => {
	return db.one('SELECT password FROM users WHERE email=$1', [email])
}

const checkUserEmail = (email) => {
	return db.one('SELECT email FROM users WHERE email=$1', [email])
}

module.exports = {
	insertUser,
	checkUserPassword,
	checkUserEmail
}
