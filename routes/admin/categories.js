const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");
const faker = require("faker");

router.all("/*", (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

router.get("/", (req, res) => {
  res.render("admin/categories/index");
});

module.exports = { router };
