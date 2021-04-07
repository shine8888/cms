const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const Category = require("../../models/Category");
const User = require("../../models/User");
const Comment = require("../../models/Comment");
const bcryptjs = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");

router.all("/*", (req, res, next) => {
	req.app.locals.layout = "home";
	next();
});

router.get("/", (req, res) => {
	Post.find({})
		.lean()
		.then((posts) => {
			Category.find({})
				.lean()
				.then((categories) => {
					res.render("home/index", { posts: posts, categories: categories });
				});
		});
});

router.get("/about", (req, res) => {
	res.render("home/about");
});

router.get("/login", (req, res) => {
	res.render("home/login");
});

// App Login
passport.use(
	new LocalStrategy(
		{ usernameField: "email", passReqToCallback: true },
		function (req, email, password, done) {
			User.findOne({ email: email }).then((user) => {
				console.log(user);
				if (!user) {
					return done(null, false, { message: "Incorrect username." });
				}
				bcryptjs.compare(password, user.password, (err, matched) => {
					if (err) return err;
					if (matched) {
						return done(null, user);
					} else {
						return done(null, false, { message: "Incorrect password." });
					}
				});
			});
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});

router.post("/login", (req, res, next) => {
	passport.authenticate("local", {
		successRedirect: "/admin",
		failureRedirect: "/login",
		failureFlash: true,
	})(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/login");
});

router.get("/register", (req, res) => {
	res.render("home/register");
});

router.post("/register", (req, res) => {
	let errors = [];
	if (!req.body.firstName) {
		errors.push({ message: "Please add first name" });
	}

	if (!req.body.lastName) {
		errors.push({ message: "Please add last name" });
	}

	if (!req.body.email) {
		errors.push({ message: "Please add email" });
	}

	if (!req.body.password) {
		errors.push({ message: "Please add password" });
	}

	if (req.body.passwordConfirm !== req.body.password) {
		errors.push({ message: "Please enter a matching password" });
	}

	if (errors.length > 0) {
		res.render("home/register", {
			errors: errors,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
		});
	} else {
		User.findOne({ email: req.body.email }).then((user) => {
			if (!user) {
				const newUser = new User({
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					email: req.body.email,
					password: req.body.password,
				});
				bcryptjs.genSalt(10, (err, salt) => {
					bcryptjs.hash(newUser.password, salt, (err, hash) => {
						newUser.password = hash;
						newUser.save().then((savedUser) => {
							req.flash(
								"success_message",
								"You are now registerd, please login"
							);
							res.redirect("/login");
						});
					});
				});
			} else {
				req.flash("error_message", "This email exist, please login");
				res.redirect("/login");
			}
		});
	}
});

router.get("/posts/:id", (req, res) => {
	Post.findOne({ _id: req.params.id })
		.populate({
			path: "comments",
			match: { approveComment: true },
			populate: { path: "user", model: "users" },
		})
		.populate("user")
		.lean()
		.then((post) => {
			Category.find({})
				.lean()
				.then((categories) => {
					res.render("home/post", {
						post: post,
						categories: categories,
					});
				});
		});
});

module.exports = { router };
