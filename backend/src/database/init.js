const connect = require('../config/database');

async function init() {
  const db = await connect();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matricula TEXT UNIQUE,
      nome TEXT,
      perfil TEXT,
      senha TEXT,
      primeiro_acesso INTEGER
    );

    CREATE TABLE IF NOT EXISTS equipe (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lider_matricula TEXT,
      matricula TEXT,
      nome TEXT
    );

    CREATE TABLE IF NOT EXISTS rdc (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lider_matricula TEXT,
      data TEXT,
      atividades TEXT,
      ocorrencias TEXT
    );

    CREATE TABLE IF NOT EXISTS producao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lider_matricula TEXT,
      equipe TEXT,
      quantidade INTEGER,
      observacao TEXT,
      data TEXT
    );
  `);

  console.log('✅ Banco SQLite inicializado');
}

init().catch(err => {
  console.error('❌ Erro ao inicializar o banco:', err);
});
