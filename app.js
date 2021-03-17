const express = require("express");
const app = express();
const path = require("path");
const exhbs = require("express-handlebars");
const publicPath = express.static(path.join(__dirname, "./public"));
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const upload = require("express-fileupload");
const session = require("express-session");
const flash = require("connect-flash");
const { mongoDbUrl } = require("./config/database");
const passport = require("passport");

mongoose.Promise = global.Promise;
mongoose
  .connect(mongoDbUrl, { useMongoClient: true })
  .then((db) => {
    console.log("Mongo connected");
  })
  .catch((error) => console.log(error));

// Set the view engine
const { select, generateTime } = require("./helpers/handlebars-helpers");

app.engine(
  "handlebars",
  exhbs({
    defaultLayout: "home",
    helpers: { select: select, generateTime: generateTime },
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

app.use(bodyParser.json());

// Method Override
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "Shine123_loving_Cathi",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

// Using Passport
app.use(passport.initialize());
app.use(passport.session());

// Local variables using middleware
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_message = req.flash("success_message");
  res.locals.error_message = req.flash("error_message");
  res.locals.error = req.flash("error");

  next();
});

// Load routes
const { router: main } = require("./routes/home/main");
const { router: admin } = require("./routes/admin/admin");
const { router: posts } = require("./routes/admin/posts");
const { router: categories } = require("./routes/admin/categories");

// Use routes
app.use("/", main);
app.use("/admin", admin);
app.use("/admin/posts", posts);
app.use("/admin/categories", categories);

app.listen(3000, () => {
  console.log(`listening  on port 3000`);
});
