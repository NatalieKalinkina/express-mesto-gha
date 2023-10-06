const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => res.status(500).send(err.message));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link })
    .then((card) => {
      res.send({ data: card });
      console.log(req.user._id);
    })
    .catch((err) => res.status(500).send(err.message));
};

module.exports.removeCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then(() => res.send('Карточка успешно удалена'))
    .catch((err) => res.status(500).send(err.message));
};
