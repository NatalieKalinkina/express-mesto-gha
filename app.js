const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;

const app = express();

const appRouter = require('./routes/index');
const { NOT_FOUND } = require('./constants');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
});
app.use((req, res, next) => {
  req.user = { _id: '65200b0e226d52e48ed51ee4' };
  next();
});

app.use('/', appRouter);

app.use((req, res) => {
  res.status(NOT_FOUND).send({ message: 'Такой страницы не существует' });
});

app.listen(PORT);
