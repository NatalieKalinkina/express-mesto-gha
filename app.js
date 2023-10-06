const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;

const app = express();
const userRouter = require('./routes/users');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
});
app.use('/', userRouter);

app.use((req, res, next) => {
  req.user = { _id: '65200b0e226d52e48ed51ee4' };
  next();
});

app.listen(PORT);

// 65200b0e226d52e48ed51ee4
