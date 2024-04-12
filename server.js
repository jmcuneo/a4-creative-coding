const express = require("express"),
  app = express(),
  hbs = require("express-handlebars").engine,
  cors = require("cors");

app.engine("handlebars", hbs());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index", { layout: false });
});

app.get("/about", (req, res) => {
  res.render("about", { layout: false });
});

app.listen(3000);
