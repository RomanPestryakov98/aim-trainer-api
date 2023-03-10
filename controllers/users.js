require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Conflict = require('../errors/Conflict');
const InternalServerError = require('../errors/InternalServerError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.signout = (req, res) => {
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true }).send({ message: 'Signed Out' });
};

module.exports.login = (req, res, next) => {
  const {
    email, name, password,
  } = req.body;

  let login = name ? { name: name } : { email: email };

  return User.findUserByCredentials(login, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
        .send({ message: 'ok' });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    email, name, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, name, password: hash,
    }))
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.code === 11000) {
        if (JSON.stringify(err.keyPattern).startsWith(`{"email":`)) {
          next(new Conflict('Пользователь с такой почтой уже существует'));
        }
        else {
          next(new Conflict('Пользователь с таким логином уже существует'));
        }
      } else if (err.name === 'ValidationError') {
        next(next);
      } else {
        next(new InternalServerError());
      }
    });
};

module.exports.infoUser = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .then((user) => {
      res.send(user)
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { email, name } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { email, name },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) {
        throw new NotFound('Некорректный id пользователя');
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.code === 11000) {
        if (JSON.stringify(err.keyPattern).startsWith(`{"email":`)) {
          next(new Conflict('Пользователь с такой почтой уже существует'));
        }
        else {
          next(new Conflict('Пользователь с таким логином уже существует'));
        }
        return;
      }
      if (err.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные'));
        return;
      }
      next(err);
    });
};