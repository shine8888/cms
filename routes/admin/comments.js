const express = require("express");
const router = express.Router();
const Comment = require("../../models/Comment");
const Post = require("../../models/Post");

router.get("/", (req, res) => {
	Comment.find({ user: req.user._id })
		.lean()
		.populate("user")
		.then((comments) => {
			res.render("admin/comments", { comments: comments });
		});
});

router.post("/", (req, res) => {
	Post.findOne({ _id: req.body.idPost }).then((post) => {
		const newComment = new Comment({
			user: req.user._id,
			body: req.body.body,
		});
		post.comments.push(newComment);
		post.save().then((savedPost) => {
			newComment.save().then((savedComment) => {
				res.redirect(`/posts/${post._id}`);
			});
		});
	});
});

router.delete("/:id", (req, res) => {
	Comment.deleteOne({ _id: req.params.id }).then((err) => {
		Post.findOneAndUpdate(
			{ comments: req.params.id },
			{ $pull: { comments: req.params.id } },
			(err, data) => {
				if (err) {
					throw err;
				}
				res.redirect("/admin/comments");
			}
		);
	});
});
module.exports = { router };
