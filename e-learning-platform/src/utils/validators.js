const { body } = require('express-validator');

exports.userValidationRules = () => [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').isMobilePhone('pt-AO'),
  body('idNumber').matches(/^\d{9}[A-Z]{2}\d{3}$/)
];

exports.courseValidationRules = () => [
  body('title').isLength({ min: 5 }),
  body('description').isLength({ min: 20 }),
  body('price').isFloat({ min: 0 })
];
