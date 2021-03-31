module.exports = {
	userAuthenticated: function (req, res, next) {
		console.log(req.session);
		console.log(req.user);
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect("/login");
		}
	},
};
