const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");

router.all("/*", (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

router.get("/", (req, res) => {
  Category.find({})
    .lean()
    .then((categories) => {
      res.render("admin/categories/index", { categories: categories });
    });
});

router.post("/create", (req, res) => {
  const newCategory = new Category({
    name: req.body.name,
  });

  newCategory.save().then((savedCategory) => {
    res.redirect("/admin/categories");
  });
});

// Route to edit Category
router.get("/edit/:id", (req, res) => {
  Category.findOne({ _id: req.params.id })
    .lean()
    .then((category) => {
      res.render("admin/categories/edit", { category: category });
    });
});

router.put("/edit/:id", (req, res) => {
  Category.findOne({ _id: req.params.id })
    .then((category) => {
      category.name = req.body.name;
      category.date = Date.now();

      category.save().then((category) => {
        res.redirect("/admin/categories");
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.delete("/delete/:id", (req, res) => {
  Category.remove({ _id: req.params.id }).then((err) => {
    res.redirect("/admin/categories");
  });
});

module.exports = { router };
