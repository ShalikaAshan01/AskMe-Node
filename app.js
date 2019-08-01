var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var cors = require('cors');
var cowsay = require("cowsay");
const mongoose = require('mongoose');
const fetchBg = require('./controllers/backgroundController');
const passportSetup = require('./config/passport-setup');
const passport = require('passport');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/UsersRoutes');
var backgroundRouter = require('./routes/ImagesRoute');
var tagsRouter = require('./routes/tagsRoute');
var questionRouter = require('./routes/QuestionsRoute');
var answerRouter = require('./routes/AnswerRoutes');
var app = express();

//enable cors
app.use(cors());

//connect to mongoose
mongoose.connect('mongodb://localhost/askme', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(()=>{
  // console.log(cowsay.say({
  //   text : "Successfully connected with mongodb",
  //   e : "oo",
  // }));
  console.log(new Date()+" : Successfully connected with mongodb");
  fetchBg.fetchBackgrounds();
}).catch(err=>{
  console.log(err)
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));

app.use(express.static(path.join(__dirname, 'public')));

// initalize passport
app.use(passport.initialize());
// deserialize cookie from the browser
app.use(passport.session());
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/background', backgroundRouter);
app.use('/tags', tagsRouter);
app.use('/questions', questionRouter);
app.use('/answers', answerRouter);

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

module.exports = app;