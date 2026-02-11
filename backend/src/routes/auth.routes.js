const express = require("express");
const router = express.Router();
const { db } = require("../database/db");

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

module.exports = router;
