const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');


// 🔹 Simulação de "banco de dados" em memória
const usuarios = {
  '123456': {
    matricula: '123456',
    // senha inicial = matrícula (JÁ CRIPTOGRAFADA)
    senha: bcrypt.hashSync('123456', 10),
    primeiroAcesso: true,
    nome: 'Usuário Teste',
    perfil: 'colaborador'
  }
};

// 🔐 LOGIN
async function login(req, res) {
  const { matricula, senha } = req.body;

  if (!matricula || !senha) {
    return res.status(400).json({ message: 'Matrícula e senha são obrigatórias' });
  }

  const regexMatricula = /^\d{6}$/;
  if (!regexMatricula.test(matricula)) {
    return res.status(400).json({ message: 'Matrícula inválida (6 dígitos)' });
  }

  const usuario = usuarios[matricula];
  if (!usuario) {
    return res.status(401).json({ message: 'Usuário não encontrado' });
  }

  // 🔐 compara senha digitada com hash
  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    return res.status(401).json({ message: 'Senha incorreta' });
  }

  const token = jwt.sign(
  {
    matricula: usuario.matricula,
    perfil: usuario.perfil
  },
  jwtConfig.secret,
  { expiresIn: jwtConfig.expiresIn }
);

return res.json({
  success: true,
  primeiroAcesso: usuario.primeiroAcesso,
  token,
  usuario: {
    matricula: usuario.matricula,
    nome: usuario.nome,
    perfil: usuario.perfil
  }
});

}

// 🔁 TROCAR SENHA
async function trocarSenha(req, res) {
  const { matricula, novaSenha } = req.body;

  if (!matricula || !novaSenha) {
    return res.status(400).json({ message: 'Dados obrigatórios' });
  }

  const usuario = usuarios[matricula];
  if (!usuario) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  if (novaSenha.length < 6) {
    return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres' });
  }

  if (novaSenha === matricula) {
    return res.status(400).json({ message: 'A nova senha não pode ser igual à matrícula' });
  }

  // 🔐 gera hash da nova senha
  const hash = await bcrypt.hash(novaSenha, 10);

  usuario.senha = hash;
  usuario.primeiroAcesso = false;

  return res.json({
    success: true,
    message: 'Senha alterada com sucesso'
  });
}

module.exports = {
  login,
  trocarSenha
};
