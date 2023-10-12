const mongoose = require('mongoose');
const Card = require('../models/card');

const {
  OK,
  CREATED,
} = require('../constants');

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.status(OK).send({ cards }))
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

module.exports.createCard = (req, res, next) => {
  const ownerId = req.user._id;
  const { name, link } = req.body;
  Card.create({ name, link })
    .then((card) => {
      res.status(CREATED).send({
        likes: card.likes,
        _id: card._id,
        name: card.name,
        link: card.link,
        owner: ownerId,
        createdAt: card.createdAt,
      });
    })
    .catch((err) => {
      console.log(err);
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      } else {
        next(err);
      }
    });
};

module.exports.removeCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new NotFoundError('Карточка с указанным _id не найдена'))
    .then(() => res.status(OK).send({ message: 'Карточка успешно удалена' }))
    .catch((err) => {
      console.log(err);
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Передан некорректный формат _id карточки'));
      } else {
        next(err);
      }
    });
};

const updateLike = (req, res, next, whatToDoWithLike) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    whatToDoWithLike,
    { new: true },
  )
    .orFail(new NotFoundError('Передан несуществующий _id карточки'))
    .then((card) => res.status(OK).send({
      likes: card.likes,
      _id: card._id,
      name: card.name,
      link: card.link,
      owner: req.user._id,
      createdAt: card.createdAt,
    }))
    .catch((err) => {
      console.log(err);
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Переданы некорректные данные для постановки/снятия лайка'));
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  const whatToDoWithLike = { $addToSet: { likes: req.user._id } };
  return updateLike(req, res, next, whatToDoWithLike);
};

module.exports.dislikeCard = (req, res, next) => {
  const whatToDoWithLike = { $pull: { likes: req.user._id } };
  return updateLike(req, res, next, whatToDoWithLike);
};

// module.exports.likeCard = (req, res, next) => {
//   Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $addToSet: { likes: req.user._id } },
//     { new: true },
//   )
//     .orFail(new NotFoundError('Передан несуществующий _id карточки'))
//     .then((card) => res.status(OK).send({
//       likes: card.likes,
//       _id: card._id,
//       name: card.name,
//       link: card.link,
//       owner: req.user._id,
//       createdAt: card.createdAt,
//     }))
//     .catch((err) => {
//       console.log(err);
//       if (err instanceof mongoose.Error.CastError) {
//         next(new BadRequestError('Переданы некорректные данные для постановки/снятия лайка'));
//       } else {
//         next(err);
//       }
//     });
// };

// module.exports.dislikeCard = (req, res, next) => {
//   Card.findByIdAndUpdate(
//     req.params.cardId,
//     { $pull: { likes: req.user._id } },
//     { new: true },
//   )
//     .orFail(new NotFoundError('Передан несуществующий _id карточки'))
//     .then((card) => res.status(OK).send({
//       likes: card.likes,
//       _id: card._id,
//       name: card.name,
//       link: card.link,
//       owner: req.user._id,
//       createdAt: card.createdAt,
//     }))
//     .catch((err) => {
//       console.log(err);
//       if (err instanceof mongoose.Error.CastError) {
//         next(new BadRequestError('Переданы некорректные данные для постановки/снятия лайка'));
//       } else {
//         next(err);
//       }
//     });
// };
