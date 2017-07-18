const express = require('express')
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const pgp = require('pg-promise')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const {
	insertUser,
	checkUserPassword,
 	checkUserEmail
} = require('./database/queries')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressValidator())
app.use(cookieParser())

app.set('view engine', 'ejs')

app.use(session({
	secret: 'keyboard cat',
	resave: true,
	saveUnititalized: true,
	cookie: {
		maxAge: 30 * 60 * 1000
	}
}))

app.use(require('connect-flash')())
app.use((req, res, next) => {
	res.locals.messages = require('express-messages')(req, res)
	next()
})

app.use(expressValidator({
	errorFormatter: (param, msg, value) => {
		let namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root

		while(namespace.length) {
			formparam += '[' + namespace.shift() + ']'
		}

		return {
			param: formParam,
			msg : msg,
			value: value
		}
	}
}))

app.get('/', (req, res) => {
	res.render('home.ejs')
})

app.route('/signup')
	.get((req, res) => {
		res.render('signup.ejs')
	})
	.post((req, res) => {
		if (
			req.body.email === '' &&
			req.body.password === '' &&
			req.body.passwordConfirmation === ''
		) {
			req.flash('no values', 'please provide an email and a password to sign up')
			res.redirect('/signup')
		} else if (
			req.body.password !== req.body.passwordConfirmation
		) {
			req.flash('password not matching', 'password do not match')
			res.redirect('/signup')
		} else {
			const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
			const email = req.body.email
			insertUser(email, hash)
			.then((data) => {
				req.session.email = data.email
				res.render('loggedIn.ejs', { data: req.session.email })
			})
			.catch((error) => {
				console.log(error)
				res.redirect('signup')
			})
		}
	})

app.route('/login')
	.get((req, res) => {
		res.render('login.ejs')
	})
	.post((req, res) => {
		if (
			req.body.email === '' &&
			req.body.password === ''
		) {
			req.flash('no values', 'please provide an email and a password to login')
			res.redirect('/login')
		}
		const email = req.body.email
		checkUserPassword(email)
			.then((data) => {
				if (bcrypt.compareSync(req.body.password, data.password)) {
					req.session.email = data.email
					res.render('loggedIn.ejs', { data: email })
				} else {
					req.flash('incorrect values', 'incorrect email or password')
					res.redirect('/login')
				}
			})
			.catch((error) => {
				req.flash('incorrect values', 'incorrect email or password')
				res.redirect('/login')
			})
	})

app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) throw err
		res.redirect('/')
	})
})

const port = 3000

app.listen(port, () => {
	console.log('Express server running on port:', port)
})
