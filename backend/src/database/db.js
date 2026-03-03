const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const path = require("path");

const file = path.join(__dirname, "efetivo360.json");
const adapter = new JSONFile(file);

// ✅ DEFAULT DATA (OBRIGATÓRIO NO LOWDB v6)
const defaultData = {
  usuarios: [],
  historico: [],
  producoes: [],
  rdc: [],
  metas: [],
  atividades: [],
  solicitacoes: []
};

const db = new Low(adapter, defaultData);

async function initDB() {
  await db.read();
  await db.write();
  console.log("Banco JSON inicializado");
}

module.exports = { db, initDB };
