const http = require("http");
const mysql = require("mysql2/promise");

const DB_HOST = "db";
const DB_PORT = 3306;
const DB_USER = "user";
const DB_PASSWORD = "user";
const DB_NAME = "fullcycle";

function randomName() {
  const names = [
    "Guilherme",
    "Maria",
    "Joao",
    "Ana",
    "Pedro",
    "Carla",
    "Bruno",
    "Fernanda",
    "Marcos",
    "Patricia"
  ];
  const suffix = Math.floor(Math.random() * 10000);
  return `${names[Math.floor(Math.random() * names.length)]} ${suffix}`;
}

async function waitForDb() {
  const maxTries = 60;
  for (let i = 1; i <= maxTries; i++) {
    try {
      const conn = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME
      });
      await conn.ping();
      await conn.end();
      console.log("Banco de dados está pronto!");
      return;
    } catch (err) {
      console.log(`Aguardando conexão com o banco de dados... tentativa ${i}/${maxTries}`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("Banco de dados não ficou pronto a tempo");
}

async function handleRequest(res) {
  let conn;

  try {
    conn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME
    });

    // fallback para garantir a tabela
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS people (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )
    `);

    const name = randomName();
    await conn.execute("INSERT INTO people (name) VALUES (?)", [name]);

    const [rows] = await conn.execute("SELECT name FROM people ORDER BY id DESC");

    const listItems = rows
      .map((r) => `<li>${escapeHtml(String(r.name))}</li>`)
      .join("");

    const html = `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Full Cycle</title>
        </head>
        <body>
          <h1>Full Cycle Rocks!</h1>
          <ul>${listItems}</ul>
        </body>
      </html>
    `.trim();

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Erro: ${err.message}\n`);
  } finally {
    if (conn) {
      try { await conn.end(); } catch (_) {}
    }
  }
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

(async () => {
  await waitForDb();

  const server = http.createServer(async (req, res) => {
    if (req.url !== "/") {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not found");
    }
    await handleRequest(res);
  });

  const port = 3000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Aplicativo iniciado na ${port}`);
  });
})();
