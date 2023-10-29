require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');

const { PORT = 3000 } = process.env;

const app = express();

const auth = require('./middlewares/auth');
const appRouter = require('./routes');

app.use(express.static(path.join(__dirname, 'public')));
const { createUser, login } = require('./controllers/users');
const { URL_REGEXP, SERVER_ERROR } = require('./constants');
const NotFoundError = require('./errors/NotFoundError');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
});

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(URL_REGEXP),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

app.use(auth);

app.use(appRouter);

app.use(errors());

app.use(() => {
  throw new NotFoundError('Такой страницы не существует');
});

app.use((err, req, res, next) => {
  if (err.statusCode === SERVER_ERROR) {
    res.status(SERVER_ERROR).send({ message: 'Server error' });
  } else {
    res.status(err.statusCode).send({ message: err.message });
  }
  next();
});

app.listen(PORT);
