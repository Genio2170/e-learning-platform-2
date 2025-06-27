const { body } = require('express-validator');

exports.validateCourse = [
  body('title')
    .trim()
    .notEmpty().withMessage('Título é obrigatório')
    .isLength({ min: 5 }).withMessage('Mínimo 5 caracteres'),

  body('description')
    .trim()
    .notEmpty().withMessage('Descrição é obrigatória')
    .isLength({ min: 20 }).withMessage('Mínimo 20 caracteres'),

  body('price')
    .isFloat({ min: 0 }).withMessage('Preço inválido'),

  body('category')
    .notEmpty().withMessage('Categoria é obrigatória'),

  body('teacher')
    .isMongoId().withMessage('Professor inválido')
];
