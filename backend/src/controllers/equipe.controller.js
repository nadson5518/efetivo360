const equipes = {};

function listarEquipe(req, res) {
  const lider = req.usuario.matricula;
  res.json(equipes[lider] || []);
}

function adicionarMembro(req, res) {
  const lider = req.usuario.matricula;
  const { matricula, nome } = req.body;

  if (!matricula || !nome) {
    return res.status(400).json({ message: 'Dados obrigatórios' });
  }

  equipes[lider] = equipes[lider] || [];
  equipes[lider].push({ matricula, nome });

  res.json({ success: true });
}

module.exports = { listarEquipe, adicionarMembro };
