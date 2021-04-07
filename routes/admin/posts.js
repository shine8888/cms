const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const Category = require("../../models/Category");
const { isEmpty, uploadDir } = require("../../helpers/upload-helpers");
const fs = require("fs");
const path = require("path");
const flash = require("connect-flash");
const { throws } = require("assert");

router.all("/*", (req, res, next) => {
	req.app.locals.layout = "admin";
	next();
});

router.get("/", (req, res) => {
	Post.find({})
		.populate("category")
		.lean()
		.then((posts) => {
			res.render("admin/posts", { posts: posts });
		});
});

router.get("/my-posts", (req, res) => {
	Post.find({ user: req.user._id })
		.populate("category")
		.lean()
		.then((posts) => {
			res.render("admin/posts/my-posts", { posts: posts });
		});
});

router.get("/create", (req, res) => {
	Category.find({})
		.lean()
		.then((categories) => {
			res.render("admin/posts/create", { categories: categories });
		});
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
		user: req.user._id,
		title: req.body.title,
		status: req.body.status,
		allowComments: allowComments,
		body: req.body.body,
		category: req.body.category,
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
			Category.find({})
				.lean()
				.then((categories) => {
					res.render("admin/posts/edit", {
						post: post,
						categories: categories,
					});
				});
		});
});

router.put("/edit/:id", (req, res) => {
	Post.findOne({ _id: req.params.id }).then((post) => {
		if (!req.body.allowComments) {
			req.body.allowComments = false;
		} else {
			req.body.allowComments = true;
		}
		post.user = req.user._id;
		post.title = req.body.title;
		post.status = req.body.status;
		post.allowComments = req.body.allowComments;
		post.body = req.body.body;
		post.category = req.body.category;

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
				res.redirect("/admin/posts/my-posts");
			})
			.catch((error) => {
				console.log(error);
			});
	});
});

router.delete("/:id", (req, res) => {
	Post.findOne({ _id: req.params.id })
		.populate("comments")
		.then((post) => {
			fs.unlink(uploadDir + post.file, (err) => {
				if (!post.comments.length < 1) {
					post.comments.forEach((comment) => {
						comment.remove();
					});
				}
				post.remove().then((err) => {
					req.flash(
						"success_message",
						`Post ${post.title} was successfully deleted`
					);
					res.redirect("/admin/posts/my-posts");
				});
			});
		});
});

module.exports = { router };
