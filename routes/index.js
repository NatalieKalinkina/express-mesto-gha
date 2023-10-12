const router = require('express').Router();

const userRouter = require('./users');
const cardRouter = require('./cards');
const { SERVER_ERROR } = require('../constants');
const NotFoundError = require('../errors/NotFoundError');

router.use('/users', userRouter);
router.use('/cards', cardRouter);

router.use(() => {
  throw new NotFoundError('Такой страницы не существует');
});

router.use((err, req, res, next) => {
  if (err.statusCode === SERVER_ERROR) {
    res.status(SERVER_ERROR).send({ message: 'Server error' });
  } else {
    res.status(err.statusCode).send({ message: err.message });
  }
  next();
});

module.exports = router;
