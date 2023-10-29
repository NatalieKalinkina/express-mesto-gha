const jwt = require('jsonwebtoken');
// const { UnauthorizedError } = require('../errors/UnauthorizedError');
const { UNAUTHORIZED } = require('../constants');

const { JWT_SECRET = 'secret-key' } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    // next(new UnauthorizedError('Необходима авторизация'));
    res.status(UNAUTHORIZED).send({ message: 'Необходима авторизация' });
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // next(new UnauthorizedError('Необходима авторизация'));
    res.status(UNAUTHORIZED).send({ message: 'Необходима авторизация' });
  }
  req.user = payload;
  next();
};
