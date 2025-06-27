const moment = require('moment');

module.exports = {
  formatDate: (date, format = 'DD/MM/YYYY HH:mm') => {
    return moment(date).format(format);
  },

  generateRandomCode: (length = 6) => {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
  },

  slugify: (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  }
};
