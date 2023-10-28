const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const {
  OK,
  CREATED,
} = require('../constants');

const saltRounds = 10;

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(OK).send({ users }))
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному _id не найден');
    })
    .then((user) => res.status(OK).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
    }))
    .catch((err) => {
      console.log(err);
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Передан некорректный формат _id пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному _id не найден');
    })
    .then((user) => res.status(OK).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
    }))
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, saltRounds)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    }))
    .then((user) => res.status(CREATED).send({
      _id: user._id,
      email: user.email,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
    }))
    .catch((err) => {
      console.log(err);
      if (err.code === 11000) {
        res.status(409).send({ message: 'Пользователь с таким email уже зарегистрирован' });
      }
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        res.status(401).send({ message: 'Неправильные почта или пароль' });
      }
      bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            res.status(401).send({ message: 'Неправильные почта или пароль' });
          }
          const token = jwt.sign({ _id: user._id }, 'secret-key', { expiresIn: '7d' });
          res.status(OK).send({ token });
        });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

const updateUserProfile = (req, res, next, newProfileData) => {
  User.findByIdAndUpdate(req.user._id, newProfileData, { new: true, runValidators: true })
    .orFail(new NotFoundError('Пользователь по указанному _id не найден'))
    .then((user) => res.status(OK).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
    }))
    .catch((err) => {
      console.log(err);
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else {
        next(err);
      }
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  return updateUserProfile(req, res, next, { name, about });
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  return updateUserProfile(req, res, next, { avatar });
};
