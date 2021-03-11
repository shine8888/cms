const express = require("express");
const app = express();
const path = require("path");
const exhbs = require("express-handlebars");
const publicPath = express.static(path.join(__dirname, "./public"));
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost:27017/cms", { useMongoClient: true })
  .then((db) => {
    console.log("Mongo connected");
  })
  .catch((error) => console.log(error));

// Set the view engine
app.engine("handlebars", exhbs({ defaultLayout: "home" }));
app.set("view engine", "handlebars");

app.use(publicPath);

// Body Parser
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());

// Load routes
const { router: main } = require("./routes/home/main");
const { router: admin } = require("./routes/admin/admin");
const { router: posts } = require("./routes/admin/posts");

// Use routes
app.use("/", main);
app.use("/admin", admin);
app.use("/admin/posts", posts);

app.listen(3000, () => {
  console.log(`listening  on port 3000`);
});
