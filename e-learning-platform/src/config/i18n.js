// config/i18n.js
const i18n = require('i18n');

i18n.configure({
  locales: ['pt', 'en', 'es'],
  directory: __dirname + '/../locales',
  defaultLocale: 'pt',
  cookie: 'lang',
  register: global
});

module.exports = i18n;