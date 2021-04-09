const express = require("express");
const app = express();
const path = require("path");
const exhbs = require("express-handlebars");
const publicPath = express.static(path.join(__dirname, "./public"));
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const upload = require("express-fileupload");
const expressSession = require("express-session");
const flash = require("connect-flash");
const mongoDbUrl = require("./config/database");
const passport = require("passport");

mongoose.Promise = global.Promise;
mongoose
	.connect(mongoDbUrl.mongoDbUrl, { useMongoClient: true })
	.then((db) => {
		console.log("Mongo connected");
	})
	.catch((error) => console.log(error));

// Set the view engine
const {
	select,
	generateTime,
	paginate,
} = require("./helpers/handlebars-helpers");

app.engine(
	"handlebars",
	exhbs({
		defaultLayout: "home",
		helpers: { select: select, generateTime: generateTime, paginate: paginate },
	})
);
app.set("view engine", "handlebars");

app.use(publicPath);

// Upload Middleware
app.use(upload());

// Body Parser
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

// Method Override
app.use(methodOverride("_method"));

app.use(
	expressSession({
		secret: "Rusty is the worst and ugliest dog in the wolrd",
		saveUninitialized: false, // don't create session until something stored
		resave: false, //don't save session if unmodified
	})
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Local variables using middleware
app.use((req, res, next) => {
	res.locals.user = req.user || null;
	res.locals.success_message = req.flash("success_message");
	res.locals.error_message = req.flash("error_message");
	res.locals.form_errors = req.flash("form_errors");
	res.locals.error = req.flash("error");
	res.locals.message = req.flash("message");

	next();
});

// Load routes
const { router: main } = require("./routes/home/main");
const { router: admin } = require("./routes/admin/admin");
const { router: posts } = require("./routes/admin/posts");
const { router: categories } = require("./routes/admin/categories");
const { router: comments } = require("./routes/admin/comments");
const { router: charts } = require("./routes/admin/charts");

// Use routes
app.use("/", main);
app.use("/admin", admin);
app.use("/admin/posts", posts);
app.use("/admin/categories", categories);
app.use("/admin/comments", comments);
app.use("/admin/charts", charts);

app.listen(3000, () => {
	console.log(`listening  on port 3000`);
});
