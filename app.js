const express = require("express");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 3000;

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

// Función para actualizar datos semanalmente
const actualizarDatosSemanalmente = async () => {
	try {
		// Realizar la solicitud a la API y guardar los datos en la base de datos
		const url = "https://ultimate-tennis1.p.rapidapi.com/live_leaderboard/50";
		const opciones = {
			method: "GET",
			headers: {
				"X-RapidAPI-Key": "f54b2a81dbmshbcc7d7a45a8cf74p1ab5c6jsn575020ac488a",
				"X-RapidAPI-Host": "ultimate-tennis1.p.rapidapi.com",
			},
		};

		const respuesta = await fetch(url, opciones);
		const resultado = await respuesta.json();
		const datosAPI = resultado.data;
    console.log(resultado)

		// Guardar los datos en la base de datos
		datosAPI.forEach(async (dato) => {
			const query =
				"INSERT INTO Ranking (Age, Championship_Points, Last_Match_Comment, Live_Points, Name, Next_Win_Points, Points, Points_Difference, Rank, Rank_Diff) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
			const values = [
				dato.Age,
				dato.Championship_Points,
				dato.Last_Match_Comment,
				dato.Live_Points,
				dato.Name,
				dato.Next_Win_Points,
				dato.Points,
				dato.Points_Difference,
				dato.Rank,
				dato.Rank_Diff,
			];

			pool.query(query, values, (err, results, fields) => {
				if (err) {
					console.error("Error al insertar datos en la base de datos:", err);
				}
			});
		});

		console.log("Datos actualizados correctamente.");
	} catch (error) {
		console.error("Error al obtener o procesar datos de la API:", error);
	}
};
actualizarDatosSemanalmente()
// Ejecutar la función cada semana (7 días * 24 horas * 60 minutos * 60 segundos * 1000 milisegundos)
// setInterval(actualizarDatosSemanalmente, 7 * 24 * 60 * 60 * 1000);

// Rutas
app.get("/index.html", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/insertar.html", (req, res) => {
	res.sendFile(path.join(__dirname, "insertar.html"));
});

// Ruta para realizar la consulta a la base de datos
app.get("/obtenerDatosAPI", async (req, res) => {
  try {
    // Consultar datos desde la base de datos
    const consulta = "SELECT * FROM Ranking";
    pool.query(consulta, (err, resultados, campos) => {
      if (err) {
        console.error("Error al consultar datos en la base de datos:", err);
        res.status(500).json({ error: "Error interno del servidor" });
      } else {
        // Realizar cualquier otra operación que necesites con los resultados
        // En este ejemplo, simplemente respondemos con los resultados
        res.status(200).json(resultados);
      }
    });
  } catch (error) {
    console.error("Error al manejar la solicitud /obtenerDatosAPI:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Inicia el servidor
app.listen(port, () => {
	console.log(`Servidor web escuchando en el puerto ${port}`);
});
