const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const { isEmpty, uploadDir } = require("../../helpers/upload-helpers");
const fs = require("fs");
const path = require("path");
const flash = require("connect-flash");

router.all("/*", (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

router.get("/", (req, res) => {
  Post.find({})
    .lean()
    .then((posts) => {
      res.render("admin/posts", { posts: posts });
    });
});

router.get("/create", (req, res) => {
  res.render("admin/posts/create");
});

// Submit form to create an object POST
router.post("/create", (req, res) => {
  let filename = "";
  if (!isEmpty(req.files)) {
    let file = req.files.file;
    filename = Date.now() + "-" + file.name;
    let dirUploads = "./public/upload/";

    file.mv(dirUploads + filename, (err) => {
      if (err) throw err;
    });
  }

  let allowComments = true;
  if (!req.body.allowComments) {
    allowComments = false;
  }

  const newPost = new Post({
    title: req.body.title,
    status: req.body.status,
    allowComments: allowComments,
    body: req.body.body,
    file: filename,
  });

  newPost
    .save()
    .then((savedPost) => {
      req.flash(
        "success_message",
        `Post ${savedPost.title} was created succesfully `
      );
      res.redirect("/admin/posts");
    })
    .catch((validator) => {
      validator.errors;
      console.log("Could not save");
    });
});

router.get("/edit/:id", (req, res) => {
  Post.findOne({ _id: req.params.id })
    .lean()
    .then((post) => {
      console.log(post);
      res.render("admin/posts/edit", { post: post });
    });
});

router.put("/edit/:id", (req, res) => {
  Post.findOne({ _id: req.params.id }).then((post) => {
    if (!req.body.allowComments) {
      req.body.allowComments = false;
    } else {
      req.body.allowComments = true;
    }
    post.title = req.body.title;
    post.status = req.body.status;
    post.allowComments = req.body.allowComments;
    post.body = req.body.body;

    let filename = "";
    if (!isEmpty(req.files)) {
      let file = req.files.file;
      filename = Date.now() + "-" + file.name;
      post.file = filename;
      let dirUploads = "./public/upload/";

      file.mv(dirUploads + filename, (err) => {
        if (err) throw err;
      });
    }

    post
      .save()
      .then((updatedPost) => {
        req.flash(
          "success_message",
          `Post ${updatedPost.title} was updated succesfully`
        );
        res.redirect("/admin/posts");
      })
      .catch((error) => {
        console.log(error);
      });
  });
});

router.delete("/:id", (req, res) => {
  Post.findOne({ _id: req.params.id }).then((post) => {
    fs.unlink(uploadDir + post.file, (err) => {
      post.remove();
      req.flash(
        "success_message",
        `Post ${post.title} was successfully deleted`
      );
      res.redirect("/admin/posts");
    });
  });
});

module.exports = { router };
