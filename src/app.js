const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const mysql = require('mysql2');
const dotenv = require('dotenv').config();
const apiRouter = require('./routes/api');
const indexRouter = require('./routes/index');

const validationAPI = require('./middlewares/validationAPI')

const appServer = () =>{
  const app = express();
  
  app.use(cors({
    origin: process.env.FRONT_END_URL, // Sesuaikan dengan origin frontend (url)
    credentials: true, // Izinkan cookies dikirim
  }));
  
  app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONT_END_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
    next()
  })
  
  require('./database');
  const session = require('express-session');
  const MySQLStore = require('express-mysql-session')(session);
  
  // MySQL database configuration
  const envPrefix = process.env.NODE_ENV === 'production' ? 'PROD_' : 'DEV_';
  
  const DB_HOST = process.env[`${envPrefix}DB_HOST`];
  const DB_USER = process.env[`${envPrefix}DB_USER`];
  const DB_PASSWORD = process.env[`${envPrefix}DB_PASSWORD`];
  
  const options = {
    host: DB_HOST,
    port: process.env.DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: process.env.DB_NAME,
  };
  
  const sessionStore = new MySQLStore(options);

  // hapus comment ini ketika mau di deploy
  /* 
  const connection = mysql.createConnection(options);
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      console.log('Connected to the database');
    }
  });
  */
  
  app.use(session({
    key: 'session_cookie_name',
    secret: 'keyboard cat',
    store: sessionStore,
    resave: false,
    saveUninitialized: true
  }));
  
  // Optionally use onReady() to get a promise that resolves when store is ready.
  sessionStore.onReady().then(() => {
    // MySQL session store ready for use.
    console.log('MySQLStore ready');
  }).catch(error => {
    // Something went wrong.
    console.error(error);
  });
  
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');
  
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  
  // Redirect HTTP to HTTPS
  // app.use((req, res, next) => {
  //   if (req.secure) {
  //     next();
  //   } else {
  //     res.redirect(`https://${req.headers.host}${req.url}`);
  //   }
  // });
  
  app.use('/', indexRouter);
  app.use('/api', apiRouter);
  app.use(validationAPI, express.static(path.join(__dirname, '../public')));
  app.use(function(req, res, next) {
    next(createError(404));
  });
  
  app.use(function(err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }
  
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    if (req.app.get('env') === 'development') {
      res.status(err.status || 500).send(err.stack); // Show the error stack in development mode
    } else {
      res.status(err.status || 500).send('Internal Server Error');
      // or if you want to render an error page instead:
      // res.status(err.status || 500).render('error');
    }
  });
  return app;
}

const app = appServer();
module.exports = app;