const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const faker = require("faker");
const { userAuthenticated } = require("../../helpers/authentication-helpers");

router.all("/*", userAuthenticated, (req, res, next) => {
	req.app.locals.layout = "admin";
	next();
});

router.get("/", (req, res) => {
	res.render("admin/index");
});

router.post("/generate-fake-posts", (req, res) => {
	for (let i = 0; i < req.body.amount; i++) {
		let post = new Post();
		post.user = req.user._id;
		post.title = faker.name.title();
		post.status = "public";
		post.allowComments = faker.random.boolean();
		post.body = faker.lorem.sentence();

		post.save().then((savedPost) => {
			console.log("All are saved");
		});
	}
	res.redirect("/admin");
});

module.exports = { router };
