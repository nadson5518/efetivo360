const { db, initDB } = require("./db");

async function seed() {
  await initDB();
  await db.read();

  if (db.data.usuarios.length === 0) {
    db.data.usuarios.push({
      id: 1,
      nome: "Administrador",
      matricula: "000001",
      senha: "000001",
      perfil: "ADM",
      disciplina: null,
      primeiroAcesso: true
    });

    await db.write();
    console.log("Usuário ADM criado");
  } else {
    console.log("Usuários já existem");
  }
}

seed();
