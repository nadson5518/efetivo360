const express = require("express");
const router = express.Router();
const { db } = require("../database/db");


function registrarHistorico({ evento, descricao, lancadoPor, criticidade = "normal", detalhes = "" }) {
  db.data.historico ||= [];

  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR");
  const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  db.data.historico.push({
    id: Date.now(),
    data,
    hora,
    evento,
    descricao,
    detalhes,
    lancado_por: lancadoPor,
    aprovado_por: null,
    criticidade
  });
}

function obterUsuarioPorMatricula(matricula) {
  return db.data.usuarios.find(u => u.matricula === matricula);
}

function garantirLider(usuario) {
  return usuario && usuario.perfil === "Lider" && usuario.status !== "Inativo";
}

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  const { matricula, senha } = req.body;

  if (!matricula || !senha) {
    return res.status(400).json({ erro: "Informe matrícula e senha" });
  }

  await db.read();

  const usuario = db.data.usuarios.find(u => u.matricula === matricula);

  if (!usuario) {
    return res.status(401).json({ erro: "Matrícula ou senha inválida" });
  }

  if (usuario.status === "Inativo") {
    return res.status(403).json({ erro: "Usuário inativo" });
  }

  if (usuario.senha !== senha) {
    return res.status(401).json({ erro: "Matrícula ou senha inválida" });
  }

  const primeiroAcesso = usuario.senha === usuario.matricula;

  res.json({
    id: usuario.id,
    nome: usuario.nome,
    matricula: usuario.matricula,
    perfil: usuario.perfil,
    disciplina: usuario.disciplina,
    primeiroAcesso
  });
});

/* ================= TROCAR SENHA ================= */
router.post("/trocar-senha", async (req, res) => {
  const { matricula, novaSenha } = req.body;

  if (!matricula || !novaSenha) {
    return res.status(400).json({ erro: "Informe matrícula e nova senha" });
  }

  if (String(novaSenha).length < 6) {
    return res.status(400).json({ erro: "A senha deve ter no mínimo 6 caracteres" });
  }

  await db.read();

  const usuario = db.data.usuarios.find(u => u.matricula === matricula);
  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  if (novaSenha === matricula) {
    return res.status(400).json({ erro: "A nova senha não pode ser igual à matrícula" });
  }

  usuario.senha = novaSenha;
  usuario.primeiroAcesso = false;

  await db.write();

  res.json({
    sucesso: true,
    perfil: usuario.perfil
  });
});


/* ================= LANÇAR PRODUÇÃO ================= */
router.post("/producao", async (req, res) => {
  const { matricula, data, grupo, atividade, quantidade, unidade, observacao } = req.body;

  if (!matricula || !data || !grupo || !atividade || quantidade === undefined || quantidade === null) {
    return res.status(400).json({ erro: "Dados obrigatórios da produção ausentes" });
  }

  await db.read();

  const usuario = db.data.usuarios.find(u => u.matricula === matricula);
  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  db.data.producoes ||= [];

  db.data.producoes.push({
    id: Date.now(),
    matricula,
    nome: usuario.nome,
    perfil: usuario.perfil,
    data,
    grupo,
    atividade,
    quantidade: Number(quantidade),
    unidade: unidade || "un",
    observacao: observacao || "",
    criadoEm: new Date().toISOString()
  });

  registrarHistorico({
    evento: "Produção",
    descricao: `Lançamento de produção (${quantidade} ${unidade || "un"})`,
    detalhes: `${grupo} - ${atividade}`,
    lancadoPor: usuario.nome,
    criticidade: "normal"
  });

  await db.write();
  res.json({ sucesso: true });
});

/* ================= LANÇAR RDC ================= */
router.post("/rdc", async (req, res) => {
  const { matricula, data, frenteTrabalho, clima, ocorrencias, atividades } = req.body;

  if (!matricula || !data || !frenteTrabalho || !atividades) {
    return res.status(400).json({ erro: "Dados obrigatórios do RDC ausentes" });
  }

  await db.read();

  const usuario = db.data.usuarios.find(u => u.matricula === matricula);
  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  db.data.rdc ||= [];

  db.data.rdc.push({
    id: Date.now(),
    matricula,
    nome: usuario.nome,
    perfil: usuario.perfil,
    data,
    frenteTrabalho,
    clima: clima || "",
    ocorrencias: ocorrencias || "",
    atividades,
    criadoEm: new Date().toISOString()
  });

  registrarHistorico({
    evento: "RDC",
    descricao: "RDC diário registrado",
    detalhes: `${frenteTrabalho} - ${atividades}`,
    lancadoPor: usuario.nome,
    criticidade: "normal"
  });

  await db.write();
  res.json({ sucesso: true });
});

/* ================= HISTÓRICO ================= */
router.get("/historico", async (req, res) => {
  const { perfil, matricula } = req.query;

  await db.read();

  const historico = [...(db.data.historico || [])].sort((a, b) => b.id - a.id);

  if (perfil === "ADM") {
    return res.json(historico);
  }

  if (!matricula) {
    return res.status(400).json({ erro: "Informe matrícula para consulta de histórico" });
  }

  const usuario = db.data.usuarios.find(u => u.matricula === matricula);
  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  const filtrado = historico.filter(h => h.lancado_por === usuario.nome || h.lancado_por === matricula);
  return res.json(filtrado);
});

/* ================= CADASTRAR USUÁRIO ================= */
router.post("/usuarios", async (req, res) => {
  const { nome, matricula, perfil, disciplina, funcao, liderId } = req.body;

  // Validações básicas
  if (!nome || !matricula || !perfil) {
    return res.status(400).json({ erro: "Dados obrigatórios ausentes" });
  }

  if (!/^\d{6}$/.test(matricula)) {
    return res.status(400).json({ erro: "Matrícula deve ter 6 dígitos" });
  }

  await db.read();

  if (db.data.usuarios.find(u => u.matricula === matricula)) {
    return res.status(409).json({ erro: "Matrícula já cadastrada" });
  }

  // Regras por perfil
  if (perfil !== "ADM" && !disciplina) {
    return res.status(400).json({ erro: "Disciplina é obrigatória" });
  }

  if (perfil === "Colaborador") {
    if (!funcao) {
      return res.status(400).json({ erro: "Função é obrigatória para colaborador" });
    }
    if (!liderId) {
      return res.status(400).json({ erro: "Líder é obrigatório para colaborador" });
    }
  }

  const novoUsuario = {
    id: Date.now(),
    nome: nome.trim(),
    matricula,
    senha: matricula, // senha inicial
    perfil,
    disciplina: perfil === "ADM" ? null : disciplina,
    funcao: perfil === "Colaborador" ? funcao : null,
    liderId: perfil === "Colaborador" ? liderId : null,
    status: "Ativo",
    primeiroAcesso: true
  };

  db.data.usuarios.push(novoUsuario);
  await db.write();

  res.json({ sucesso: true });
});

/* ================= LISTAR USUÁRIOS ================= */
router.get("/usuarios", async (req, res) => {
  await db.read();

  const usuarios = db.data.usuarios.map(u => ({
    id: u.id,
    matricula: u.matricula,
    nome: u.nome,
    perfil: u.perfil,
    disciplina: u.disciplina,
    funcao: u.funcao,
    liderId: u.liderId,
    status: u.status
  }));

  res.json(usuarios);
});

/* ================= EDITAR USUÁRIO ================= */
router.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, perfil, disciplina, funcao, liderId } = req.body;

  await db.read();

  const usuario = db.data.usuarios.find(u => String(u.id) === id);
  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  usuario.nome = nome.trim();
  usuario.perfil = perfil;

  // Ajuste automático conforme perfil
  if (perfil === "ADM") {
    usuario.disciplina = null;
    usuario.funcao = null;
    usuario.liderId = null;
  }

  if (perfil === "Lider") {
    usuario.disciplina = disciplina;
    usuario.funcao = null;
    usuario.liderId = null;
  }

  if (perfil === "Colaborador") {
    usuario.disciplina = disciplina;
    usuario.funcao = funcao;
    usuario.liderId = liderId;
  }

  await db.write();
  res.json({ sucesso: true });
});

/* ================= ATIVAR / INATIVAR ================= */
router.patch("/usuarios/:id/status", async (req, res) => {
  const { id } = req.params;

  await db.read();

  const usuario = db.data.usuarios.find(u => String(u.id) === id);
  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  usuario.status = usuario.status === "Ativo" ? "Inativo" : "Ativo";

  await db.write();
  res.json({ status: usuario.status });
});

/* ================= LISTAR LÍDERES ================= */
router.get("/lideres", async (req, res) => {
  const { disciplina } = req.query;

  await db.read();

  let lideres = db.data.usuarios.filter(
    u => u.perfil === "Lider" && u.status === "Ativo"
  );

  if (disciplina) {
    lideres = lideres.filter(l => l.disciplina === disciplina);
  }

  res.json(
    lideres.map(l => ({
      id: l.id,
      nome: l.nome,
      disciplina: l.disciplina
    }))
  );
});

/* ================= EQUIPE DO LÍDER ================= */
router.get("/equipe", async (req, res) => {
  const { matricula } = req.query;

  if (!matricula) {
    return res.status(400).json({ erro: "Informe a matrícula do líder" });
  }

  await db.read();

  const lider = obterUsuarioPorMatricula(matricula);
  if (!garantirLider(lider)) {
    return res.status(403).json({ erro: "Acesso permitido apenas para líder ativo" });
  }

  const equipe = db.data.usuarios.filter(u => u.perfil === "Colaborador" && String(u.liderId) === String(lider.id));

  return res.json(equipe.map(u => ({
    id: u.id,
    nome: u.nome,
    matricula: u.matricula,
    disciplina: u.disciplina,
    funcao: u.funcao,
    status: u.status
  })));
});


router.get("/equipe/resumo", async (req, res) => {
  const { matricula } = req.query;

  if (!matricula) {
    return res.status(400).json({ erro: "Informe a matrícula do líder" });
  }

  await db.read();

  const lider = obterUsuarioPorMatricula(matricula);
  if (!garantirLider(lider)) {
    return res.status(403).json({ erro: "Acesso permitido apenas para líder ativo" });
  }

  const equipe = db.data.usuarios.filter(u => u.perfil === "Colaborador" && String(u.liderId) === String(lider.id));

  const contagem = {
    emServico: 0,
    almoco: 0,
    almoxarifado: 0,
    paralisacao: 0,
    falta: 0,
    folga: 0
  };

  equipe.forEach(colaborador => {
    const statusEquipe = colaborador.statusEquipe || (colaborador.status === "Ativo" ? "Em Serviço" : "Falta");

    if (statusEquipe === "Em Serviço") contagem.emServico += 1;
    if (statusEquipe === "Almoço") contagem.almoco += 1;
    if (statusEquipe === "Almoxarifado") contagem.almoxarifado += 1;
    if (statusEquipe === "Paralisação") contagem.paralisacao += 1;
    if (statusEquipe === "Falta") contagem.falta += 1;
    if (statusEquipe === "Folga") contagem.folga += 1;
  });

  return res.json({
    lider: {
      id: lider.id,
      nome: lider.nome,
      matricula: lider.matricula
    },
    totalEquipe: equipe.length,
    contagem
  });
});

router.get("/colaboradores-disponiveis", async (req, res) => {
  const { matricula } = req.query;

  if (!matricula) {
    return res.status(400).json({ erro: "Informe a matrícula do líder" });
  }

  await db.read();

  const lider = obterUsuarioPorMatricula(matricula);
  if (!garantirLider(lider)) {
    return res.status(403).json({ erro: "Acesso permitido apenas para líder ativo" });
  }

  const disponiveis = db.data.usuarios.filter(u => (
    u.perfil === "Colaborador"
    && (u.liderId === null || u.liderId === undefined || u.liderId === "")
    && u.status === "Ativo"
    && (!lider.disciplina || u.disciplina === lider.disciplina)
  ));

  return res.json(disponiveis.map(u => ({
    id: u.id,
    nome: u.nome,
    matricula: u.matricula,
    disciplina: u.disciplina,
    funcao: u.funcao
  })));
});

router.patch("/colaboradores/:id/transferir", async (req, res) => {
  const { id } = req.params;
  const { matriculaLider, acao } = req.body;

  if (!matriculaLider || !acao) {
    return res.status(400).json({ erro: "Informe matriculaLider e acao" });
  }

  if (!["adicionar", "remover"].includes(acao)) {
    return res.status(400).json({ erro: "Ação inválida" });
  }

  await db.read();

  const lider = obterUsuarioPorMatricula(matriculaLider);
  if (!garantirLider(lider)) {
    return res.status(403).json({ erro: "Acesso permitido apenas para líder ativo" });
  }

  const colaborador = db.data.usuarios.find(u => String(u.id) === String(id) && u.perfil === "Colaborador");
  if (!colaborador) {
    return res.status(404).json({ erro: "Colaborador não encontrado" });
  }

  if (acao === "adicionar") {
    colaborador.liderId = lider.id;
  }

  if (acao === "remover" && String(colaborador.liderId) === String(lider.id)) {
    colaborador.liderId = null;
  }

  registrarHistorico({
    evento: "Equipe",
    descricao: `Colaborador ${acao === "adicionar" ? "adicionado" : "removido"} da equipe`,
    detalhes: `${colaborador.nome} (${colaborador.matricula})`,
    lancadoPor: lider.nome
  });

  await db.write();
  return res.json({ sucesso: true });
});

/* ================= METAS ================= */
router.get("/metas", async (req, res) => {
  const { matricula, perfil } = req.query;

  await db.read();
  db.data.metas ||= [];

  if (perfil === "ADM") {
    return res.json([...(db.data.metas || [])].sort((a, b) => b.id - a.id));
  }

  if (!matricula) {
    return res.status(400).json({ erro: "Informe a matrícula do líder" });
  }

  const lider = obterUsuarioPorMatricula(matricula);
  if (!garantirLider(lider)) {
    return res.status(403).json({ erro: "Acesso permitido apenas para líder ativo" });
  }

  const metas = db.data.metas
    .filter(meta => meta.matriculaLider === matricula || meta.disciplina === lider.disciplina)
    .sort((a, b) => b.id - a.id);

  return res.json(metas);
});

router.post("/metas", async (req, res) => {
  const { matricula, titulo, periodo, valorMeta, valorAtual } = req.body;

  if (!matricula || !titulo || !periodo || valorMeta === undefined || valorMeta === null) {
    return res.status(400).json({ erro: "Dados obrigatórios da meta ausentes" });
  }

  await db.read();

  const lider = obterUsuarioPorMatricula(matricula);
  if (!garantirLider(lider)) {
    return res.status(403).json({ erro: "Acesso permitido apenas para líder ativo" });
  }

  db.data.metas ||= [];

  const meta = {
    id: Date.now(),
    matriculaLider: matricula,
    lider: lider.nome,
    disciplina: lider.disciplina,
    titulo,
    periodo,
    valorMeta: Number(valorMeta),
    valorAtual: Number(valorAtual || 0),
    criadoEm: new Date().toISOString()
  };

  db.data.metas.push(meta);

  registrarHistorico({
    evento: "Meta",
    descricao: `Meta cadastrada (${titulo})`,
    detalhes: `${periodo}: ${meta.valorAtual}/${meta.valorMeta}`,
    lancadoPor: lider.nome
  });

  await db.write();
  return res.json({ sucesso: true, meta });
});

/* ================= SOLICITAÇÕES ================= */
router.get("/solicitacoes", async (req, res) => {
  const { matricula, perfil, status } = req.query;

  await db.read();

  db.data.solicitacoes ||= [];
  let solicitacoes = [...db.data.solicitacoes];

  if (perfil === "ADM") {
    if (status) {
      solicitacoes = solicitacoes.filter(s => s.status === status);
    }

    return res.json(solicitacoes.sort((a, b) => b.id - a.id));
  }

  if (!matricula) {
    return res.status(400).json({ erro: "Informe a matrícula do usuário" });
  }

  const usuario = obterUsuarioPorMatricula(matricula);
  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  solicitacoes = solicitacoes
    .filter(s => s.matriculaSolicitante === matricula)
    .sort((a, b) => b.id - a.id);

  return res.json(solicitacoes);
});

router.post("/solicitacoes", async (req, res) => {
  const { matricula, tipo, dataReferencia, descricao, detalhes } = req.body;

  if (!matricula || !tipo || !dataReferencia || !descricao) {
    return res.status(400).json({ erro: "Dados obrigatórios da solicitação ausentes" });
  }

  await db.read();

  const usuario = obterUsuarioPorMatricula(matricula);
  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  db.data.solicitacoes ||= [];

  const solicitacao = {
    id: Date.now(),
    matriculaSolicitante: matricula,
    nomeSolicitante: usuario.nome,
    tipo,
    dataReferencia,
    descricao,
    detalhes: detalhes || {},
    status: "Pendente",
    respostaAdm: null,
    criadoEm: new Date().toISOString()
  };

  db.data.solicitacoes.push(solicitacao);

  registrarHistorico({
    evento: "Solicitação",
    descricao: `${tipo} enviada`,
    detalhes: `${usuario.nome} - ${dataReferencia}`,
    lancadoPor: usuario.nome,
    criticidade: "normal"
  });

  await db.write();
  return res.json({ sucesso: true, solicitacao });
});

router.patch("/solicitacoes/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, respostaAdm, matriculaAdm } = req.body;

  if (!["Aprovada", "Reprovada", "Pendente"].includes(status)) {
    return res.status(400).json({ erro: "Status inválido" });
  }

  await db.read();

  const adm = obterUsuarioPorMatricula(matriculaAdm);
  if (!adm || adm.perfil !== "ADM" || adm.status === "Inativo") {
    return res.status(403).json({ erro: "Ação permitida apenas para ADM ativo" });
  }

  db.data.solicitacoes ||= [];
  const solicitacao = db.data.solicitacoes.find(s => String(s.id) === String(id));
  if (!solicitacao) {
    return res.status(404).json({ erro: "Solicitação não encontrada" });
  }

  solicitacao.status = status;
  solicitacao.respostaAdm = respostaAdm || null;
  solicitacao.aprovadoPor = adm.nome;
  solicitacao.atualizadoEm = new Date().toISOString();

  registrarHistorico({
    evento: "Solicitação",
    descricao: `Solicitação ${status.toLowerCase()}`,
    detalhes: `${solicitacao.tipo} - ${solicitacao.nomeSolicitante}`,
    lancadoPor: adm.nome,
    criticidade: status === "Reprovada" ? "critico" : "normal"
  });

  await db.write();
  return res.json({ sucesso: true, solicitacao });
});

router.get("/adm/resumo", async (req, res) => {
  await db.read();

  const usuarios = db.data.usuarios || [];
  const solicitacoes = db.data.solicitacoes || [];
  const colaboradores = usuarios.filter(u => u.perfil === "Colaborador");
  const lideres = usuarios.filter(u => u.perfil === "Lider" && u.status === "Ativo");

  const contagemEquipe = {
    emServico: 0,
    paralisacao: 0
  };

  colaboradores.forEach(colaborador => {
    const statusEquipe = colaborador.statusEquipe || (colaborador.status === "Ativo" ? "Em Serviço" : "Falta");
    if (statusEquipe === "Em Serviço") contagemEquipe.emServico += 1;
    if (statusEquipe === "Paralisação") contagemEquipe.paralisacao += 1;
  });

  const pendentes = solicitacoes.filter(s => s.status === "Pendente").length;

  return res.json({
    colaboradores: colaboradores.length,
    lideres: lideres.length,
    emServico: contagemEquipe.emServico,
    paralisacao: contagemEquipe.paralisacao,
    solicitacoesPendentes: pendentes
  });
});


module.exports = router;
