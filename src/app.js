const express = require("express");
const path = require("path");


const app = express();

// middlewares básicos
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));

// archivos estáticos
app.use(express.static(path.join(__dirname, "public")));


// rutas
app.get(["/", "/home"], (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'Menu.html'));
});

app.get("/Login" ,( req,res) =>{
  res.sendFile(path.join(__dirname, 'views', 'Login.html'));
})

// server
app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
