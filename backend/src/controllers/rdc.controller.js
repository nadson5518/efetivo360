const { rdcDB } = require('../config/db');

// 🔹 Salvar RDC
async function salvarRDC(req, res) {
  await rdcDB.read();
  rdcDB.data ||= [];

  const lider = req.usuario.matricula;
  const { data, atividades, ocorrencias } = req.body;

  if (!data || !atividades) {
    return res.status(400).json({ message: 'Data e atividades são obrigatórias' });
  }

  rdcDB.data.push({
    id: Date.now(),
    lider,
    data,
    atividades,
    ocorrencias: ocorrencias || '',
    criadoEm: new Date().toISOString()
  });

  await rdcDB.write();

  res.json({ success: true });
}

// 🔹 Listar RDC do líder
async function listarRDC(req, res) {
  await rdcDB.read();
  rdcDB.data ||= [];

  const lider = req.usuario.matricula;
  const lista = rdcDB.data.filter(r => r.lider === lider);

  res.json(lista);
}

module.exports = {
  salvarRDC,
  listarRDC
};
