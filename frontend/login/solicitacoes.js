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
if (usuario) {
  document.getElementById("solUserNome").textContent = usuario.nome;
  document.getElementById("solUserPerfil").textContent = usuario.perfil;
}

function classeStatus(status) {
  if (status === "Aprovada") return "approved";
  if (status === "Reprovada") return "rejected";
  return "pending";
}

async function carregarSolicitacoes() {
  const res = await fetch(`${API_URL}/auth/solicitacoes?matricula=${encodeURIComponent(usuario.matricula)}`);
  const lista = await res.json();
  const alvo = document.getElementById("solicitacoesLista");

  if (!Array.isArray(lista) || !lista.length) {
    alvo.innerHTML = '<p class="subtitle">Nenhuma solicitação registrada.</p>';
    return;
  }

  alvo.innerHTML = lista.map(item => `
    <div class="request-item">
      <div class="request-header">
        <strong>${item.tipo}</strong>
        <span class="request-status ${classeStatus(item.status)}">${item.status}</span>
      </div>
      <p>Data: ${item.dataReferencia}<br/>${item.descricao}</p>
    </div>
  `).join("");
}

document.getElementById("solCancelar").addEventListener("click", () => {
  document.getElementById("solicitacaoForm").reset();
});

document.getElementById("solicitacaoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    matricula: usuario.matricula,
    tipo: document.getElementById("solTipo").value,
    dataReferencia: document.getElementById("solData").value,
    descricao: document.getElementById("solDescricao").value.trim()
  };

  const res = await fetch(`${API_URL}/auth/solicitacoes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.erro || "Erro ao enviar solicitação");
    return;
  }

  e.target.reset();
  await carregarSolicitacoes();
});

carregarSolicitacoes();
