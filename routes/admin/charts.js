const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const Category = require("../../models/Category");

router.get("/", (req, res) => {
	const promises = [
		Post.count().exec(),
		Comment.count().exec(),
		Category.count().exec(),
	];

	Promise.all(promises).then(([postCount, commentCount, categoryCount]) => {
		res.render("admin/charts", {
			postCount: postCount,
			commentCount: commentCount,
			categoryCount: categoryCount,
		});
	});
});

module.exports = { router };
