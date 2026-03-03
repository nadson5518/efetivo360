function obterApiUrl() {
  const custom = window.__API_URL;
  if (custom) return custom;
  const { origin, hostname, port } = window.location;
  if (port === "3001") return `${origin}/api`;
  if (hostname === "localhost" || hostname === "127.0.0.1") return "http://localhost:3001/api";
  return `${origin}/api`;
}

const API_URL = obterApiUrl();
const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null");

if (!usuario) {
  window.location.href = "index.html";
}

function atualizarRelogio() {
  const agora = new Date();
  const hh = String(agora.getHours()).padStart(2, "0");
  const mm = String(agora.getMinutes()).padStart(2, "0");
  const relogio = document.getElementById("resumoHorario");
  if (relogio) {
    relogio.textContent = `⏱️ ${hh}:${mm}`;
  }
}

function percentual(parte, total) {
  if (!total) return "0.0%";
  return `${((parte / total) * 100).toFixed(1)}%`;
}

async function carregarResumoEquipe() {
  document.getElementById("liderNome").textContent = usuario.nome;

  const res = await fetch(`${API_URL}/auth/equipe/resumo?matricula=${encodeURIComponent(usuario.matricula)}`);
  const data = await res.json();

  if (!res.ok) {
    alert(data.erro || "Erro ao carregar visão geral da equipe.");
    return;
  }

  document.getElementById("countEmServico").textContent = data.contagem.emServico;
  document.getElementById("countAlmoco").textContent = data.contagem.almoco;
  document.getElementById("countAlmoxarifado").textContent = data.contagem.almoxarifado;
  document.getElementById("countParalisacao").textContent = data.contagem.paralisacao;
  document.getElementById("countFalta").textContent = data.contagem.falta;
  document.getElementById("countFolga").textContent = data.contagem.folga;

  document.getElementById("percEmServico").textContent = percentual(data.contagem.emServico, data.totalEquipe);
  document.getElementById("percAlmoco").textContent = percentual(data.contagem.almoco, data.totalEquipe);
  document.getElementById("percAlmoxarifado").textContent = percentual(data.contagem.almoxarifado, data.totalEquipe);
  document.getElementById("percParalisacao").textContent = percentual(data.contagem.paralisacao, data.totalEquipe);
  document.getElementById("percFalta").textContent = percentual(data.contagem.falta, data.totalEquipe);
  document.getElementById("percFolga").textContent = percentual(data.contagem.folga, data.totalEquipe);

  document.getElementById("resumoMinhaEquipe").textContent = data.totalEquipe;
  document.getElementById("resumoEmServico").textContent = data.contagem.emServico;
  document.getElementById("resumoEfetividade").textContent = percentual(data.contagem.emServico, data.totalEquipe);
}

atualizarRelogio();
setInterval(atualizarRelogio, 30000);
carregarResumoEquipe();
