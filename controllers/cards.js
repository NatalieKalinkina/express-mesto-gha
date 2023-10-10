const Card = require('../models/card');

const {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  OK,
  CREATED,
} = require('../constants');

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.status(OK).send({ cards }))
    .catch((err) => {
      console.log(err);
      return res.status(SERVER_ERROR).send({ message: 'Server Error' });
    });
};

module.exports.createCard = (req, res) => {
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
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки' });
      }
      return res.status(SERVER_ERROR).send({ message: 'Server Error' });
    });
};

module.exports.removeCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
      }
      return res.status(OK).send({ message: 'Карточка успешно удалена' });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Передан некорректный формат _id карточки' });
      }
      return res.status(SERVER_ERROR).send({ message: 'Server Error' });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
      }
      return res.status(OK).send({
        likes: card.likes,
        _id: card._id,
        name: card.name,
        link: card.link,
        owner: req.user._id,
        createdAt: card.createdAt,
      });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки/снятия лайка' });
      }
      return res.status(SERVER_ERROR).send({ message: 'Server Error' });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
      }
      return res.status(OK).send({
        likes: card.likes,
        _id: card._id,
        name: card.name,
        link: card.link,
        owner: req.user._id,
        createdAt: card.createdAt,
      });
    })
    .catch((err) => {
      console.log(err);
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки/снятия лайка' });
      }
      return res.status(SERVER_ERROR).send({ message: 'Server Error' });
    });
};
