const Game = require('../models/game');

module.exports.createGame = (req, res, next) => {
  const { time, record } = req.body;
  Game.create({ time, record, creator: req.user._id })
    .then((user) => {
      res.send(user)
    })
    .catch(next);
};

module.exports.getAllGames = (req, res, next) => {
  const { time } = req.params;

  Game.find({ time })
    .populate(['creator'])
    .then((games) => {
      res.send(games);
    })
    .catch(next);
};