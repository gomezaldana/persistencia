var createError = require('http-errors');
var express = require('express');

require('dotenv').config();

//swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/configSwagger');

//cambio
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

//swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

var carrerasRouter = require('./routes/carreras');
var materiaRouter = require('./routes/materia');
var profesorRouter = require('./routes/profesor');
var facultadRouter = require('./routes/facultad');

const login = require('./login');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/mat', materiaRouter);
app.use('/car', carrerasRouter);
app.use('/pro', profesorRouter);
app.use('/fac', facultadRouter);

app.use(login);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*
app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});
*/

module.exports = app;
