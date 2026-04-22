const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', '..', 'data');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

const db = new Database(path.join(dbPath, 'app.db'));

// Forçar WAL mode (Write-Ahead Logging) para alta performance e concorrência segura em backend
db.pragma('journal_mode = WAL');

module.exports = db;
