var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const hbs = require('hbs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var roomRouter = require('./routes/room'); 
var typeRoomRouter = require('./routes/typeRoom');
var reservationRouter = require('./routes/reservation');
var authRouter = require('./routes/auth');
var adminRouter = require('./routes/admin');


var app = express();
var session = require('express-session');
//set session timeout
const timeout = 10000 * 60 * 60 * 24;  // 24 hours (in milliseconds)
//config session parameters
app.use(session({
  secret: "practice_makes_perfect",  // Secret key for signing the session ID cookie
  resave: false,                     // Forces a session that is "uninitialized" to be saved to the store
  saveUninitialized: true,           // Forces the session to be saved back to the session store
  cookie: { maxAge: timeout },
}));


var mongoose = require('mongoose');
// var database = "mongodb://localhost:27017/finalProject";
var database = "mongodb+srv://truongpmgch200134:ClkZb5zrbdVTBsgS@beehouse.tfqdh7h.mongodb.net/finalProject";

mongoose.connect(database)
  .then(() => console.log('Connect to db successfull !'))
  .catch((err) => console.log('conncect to db fail. error : ' + err));


var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}))  
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.username = req.session.username;
  res.locals.userId = req.session.userId;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/room', roomRouter);
app.use('/typeRoom',typeRoomRouter);
app.use('/reservation',reservationRouter);
app.use('/auth', authRouter);
app.use('/admin',adminRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


hbs.registerHelper('formatDate', function(date) {
  return new Date(date).toLocaleDateString('en-GB');
});
hbs.registerHelper('eq', function(a,b) {
  return a === b;
});

module.exports = app;
