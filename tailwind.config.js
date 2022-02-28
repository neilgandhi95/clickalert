const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ["./views/*.ejs"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      transitionDelay: {
        '800': '800ms',
        '2000': '2000ms',
        '2500': '2500ms',
        '3700': '3700ms',
      }
    },
  },
  plugins: [],
}