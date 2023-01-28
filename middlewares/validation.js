const { celebrate, Joi } = require('celebrate');

const validationUpdateUser = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required().min(2).max(30),
  }),
});

const validationSignin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email(),
    name: Joi.string(),
    password: Joi.string().required(),
  }),
});

const validationSignup = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required().min(2).max(30),
    password: Joi.string().required(),
  }),
});

module.exports = {
  validationUpdateUser,
  validationSignin,
  validationSignup,
};
