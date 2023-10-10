const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;

const app = express();
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
});
app.use((req, res, next) => {
  req.user = { _id: '65200b0e226d52e48ed51ee4' };
  next();
});

app.use('/users', userRouter);
app.use('/cards', cardRouter);

app.listen(PORT);
