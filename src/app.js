const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const app = express();

// middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "Menu");

// rutas
app.get("/", (req, res) => {
  res.render("PaginaPrincipal");
});

// server
app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
