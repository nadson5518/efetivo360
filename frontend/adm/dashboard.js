function obterApiUrl() {
  if (window.__API_URL) return window.__API_URL;
  const { hostname, origin, port } = window.location;
  if (port === "3001") return `${origin}/api`;
  if (hostname === "localhost" || hostname === "127.0.0.1") return "http://localhost:3001/api";
  return `${origin}/api`;
}

const API_URL = obterApiUrl();
const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
if (!usuario) window.location.href = "../login/index.html";
if (usuario && usuario.perfil !== "ADM") window.location.href = "../login/index.html";
if (usuario) document.getElementById("admNome").textContent = usuario.nome;

async function carregarResumoAdm() {
  const res = await fetch(`${API_URL}/auth/adm/resumo`);
  const data = await res.json();
  if (!res.ok) return;

  document.getElementById("statColaboradores").textContent = data.colaboradores;
  document.getElementById("statLideres").textContent = data.lideres;
  document.getElementById("statEmServico").textContent = data.emServico;
  document.getElementById("statParalisacao").textContent = data.paralisacao;
  document.getElementById("statPendentes").textContent = data.solicitacoesPendentes;
}

carregarResumoAdm();
