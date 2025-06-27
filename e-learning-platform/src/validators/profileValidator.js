const { body } = require('express-validator');
const User = require('../models/User');

exports.validateProfileUpdate = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3 }).withMessage('Nome precisa ter pelo menos 3 caracteres'),

  body('email')
    .trim()
    .notEmpty().withMessage('E-mail é obrigatório')
    .isEmail().withMessage('E-mail inválido')
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value });
      if (user && user._id.toString() !== req.user._id.toString()) {
        throw new Error('E-mail já está em uso');
      }
      return true;
    }),

  body('phone')
    .trim()
    .notEmpty().withMessage('Telefone é obrigatório')
    .matches(/^\+244[0-9]{9}$/).withMessage('Formato: +244 seguido de 9 dígitos'),

  body('idNumber')
    .optional()
    .matches(/^[0-9]{9}[A-Za-z]{2}[0-9]{3}$/).withMessage('Número de identificação inválido'),

  body('birthDate')
    .optional()
    .isDate().withMessage('Data inválida'),

  body('address')
    .trim()
    .notEmpty().withMessage('Morada é obrigatória')
];
