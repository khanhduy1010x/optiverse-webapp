// postcss.config.js
module.exports = {
  plugins: [
    require("@tailwindcss/postcss"), // Thêm dòng này để sử dụng plugin mới
    require("autoprefixer"),
  ],
};
