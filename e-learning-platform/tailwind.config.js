module.exports = {
  content: [
    "./src/views/**/*.ejs",
    "./public/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
        }
      }
    },
  },
  plugins: [],
}

