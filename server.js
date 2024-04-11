const express = require("express"),
  app = express(),
  hbs = require("express-handlebars").engine;

app.engine("handlebars", hbs());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("index", { layout: false });
});

app.listen(3000);
