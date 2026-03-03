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

if (!usuario) window.location.href = "index.html";
if (usuario) document.getElementById("equipeUserNome").textContent = usuario.nome;

async function carregarEquipe() {
  const res = await fetch(`${API_URL}/auth/equipe?matricula=${encodeURIComponent(usuario.matricula)}`);
  const equipe = await res.json();
  const alvo = document.getElementById("equipeLista");

  if (!Array.isArray(equipe) || !equipe.length) {
    alvo.innerHTML = '<p class="subtitle">Nenhum colaborador vinculado à sua equipe.</p>';
    return;
  }

  alvo.innerHTML = equipe.map(col => `
    <div class="collaborator-card compact">
      <div class="collaborator-left">
        <div class="avatar">👤</div>
        <div class="main-info">
          <strong>${col.nome}</strong>
          <span class="meta">${col.matricula} • ${col.disciplina || "-"} • ${col.funcao || "-"}</span>
        </div>
      </div>
      <div class="collaborator-right">
        <span class="status-tag ${col.status === "Ativo" ? "ativo" : "afastado"}">${col.status}</span>
      </div>
    </div>`).join("");
}

carregarEquipe();
