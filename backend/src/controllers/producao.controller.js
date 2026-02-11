const producoes = [];

function salvarProducao(req, res) {
  const lider = req.usuario.matricula;
  const { equipe, quantidade, observacao } = req.body;

  producoes.push({
    lider,
    equipe,
    quantidade,
    observacao,
    data: new Date()
  });

  res.json({ success: true });
}

module.exports = { salvarProducao };
