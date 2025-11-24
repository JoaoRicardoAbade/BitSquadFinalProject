// server.js
const express = require("express");
const mysql = require("mysql2");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

// ⭐ Conexão MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "contador"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL conectado.");
});

// ⭐ WebSocket → envia para o HTML
const wss = new WebSocket.Server({ port: 8081 });
function broadcast(dados) {
    wss.clients.forEach(c => {
        if (c.readyState === WebSocket.OPEN) {
            c.send(JSON.stringify(dados));
        }
    });
}

// ⭐ Endpoint que o ESP32 chama
app.post("/contagem", (req, res) => {
    const { contagem } = req.body;

    db.query("INSERT INTO registros (contagem) VALUES (?)", [contagem]);

    broadcast({ contagem });

    res.send("OK");
});

// ⭐ Servidor HTTP
app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});