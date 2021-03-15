const errors = [];
module.exports = {
  getErrors: function (req) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  },

  uploadDir: path.join(__dirname, "../public/upload/"),
};
