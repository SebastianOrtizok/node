const express = require("express");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT  ||  3000;

// Configuración de la conexión a la base de datos
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "db4free.net",
  user: "sortizdevok",
  password: "esys991996",
  database: "impactotenis",
});

// Middleware para parsear el cuerpo de las solicitudes en formato URL-encoded
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/insertar.html", (req, res) => {
  res.sendFile(path.join(__dirname, "insertar.html"));
});


// Ruta para realizar la consulta a la base de datos
app.get("/sql_consultas", (req, res) => {
  // Realizar la consulta a la base de datos
  const query = "SELECT * FROM ML";

  pool.query(query, (err, results, fields) => {
    if (err) {
      console.error("Error al ejecutar la consulta:", err);
      return res.status(500).json({ error: "Error interno del servidor", details: err.message });
    }

    // Enviar los resultados como respuesta JSON
    res.json(results);
  });
});




// Nueva ruta para agregar datos
app.post("/agregar", (req, res) => {
  const { nombreNuevo, apellidoNuevo } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error al obtener conexión del pool:", err);
      return res.status(500).json({ error: "Error interno del servidor", details: err.message });
    }

    const insertQuery = "INSERT INTO ML (Nombre, Apellido) VALUES (?, ?)";

    connection.query(insertQuery, [nombreNuevo, apellidoNuevo], (err, results, fields) => {
      connection.release(); // Liberar la conexión de vuelta al pool

      if (err) {
        console.error("Error al insertar datos:", err);
        return res.status(500).json({ error: "Error interno del servidor", details: err.message });
      }

      res.send("Datos insertados correctamente");
    });
  });
});

// Inicia el servidor
app.listen(process.env.PORT  ||  3000)
  console.log(`Servidor web escuchando en `, process.env.PORT  ||  3000);
;
