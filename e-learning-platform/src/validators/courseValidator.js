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


exports.validateCourse = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5 }).withMessage('Minimum 5 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20 }).withMessage('Minimum 20 characters'),

  body('category')
    .notEmpty().withMessage('Category is required')
];

exports.validateLesson = [
  body('title')
    .trim()
    .notEmpty().withMessage('Lesson title is required'),

  body('content')
    .trim()
    .notEmpty().withMessage('Lesson content is required')
];

