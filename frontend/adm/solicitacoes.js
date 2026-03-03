function obterApiUrl() {
  if (window.__API_URL) return window.__API_URL;
  const { hostname, origin, port } = window.location;
  if (port === "3001") return `${origin}/api`;
  if (hostname === "localhost" || hostname === "127.0.0.1") return "http://localhost:3001/api";
  return `${origin}/api`;
}

const API_URL = obterApiUrl();
const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null");
if (!usuario || usuario.perfil !== "ADM") window.location.href = "../login/index.html";
if (usuario) document.getElementById("admNome").textContent = usuario.nome;

async function atualizarStatus(id, status) {
  const respostaAdm = prompt(`Informe observação para ${status} (opcional):`) || "";
  const res = await fetch(`${API_URL}/auth/solicitacoes/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, respostaAdm, matriculaAdm: usuario.matricula })
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.erro || "Erro ao atualizar solicitação.");
    return;
  }

  await carregarSolicitacoes();
}

function classeStatus(status) {
  if (status === "Aprovada") return "ativo";
  if (status === "Reprovada") return "inativo";
  return "ativo";
}

async function carregarSolicitacoes() {
  const status = document.getElementById("filtroStatus").value;
  const query = new URLSearchParams({ perfil: "ADM" });
  if (status) query.set("status", status);

  const res = await fetch(`${API_URL}/auth/solicitacoes?${query.toString()}`);
  const itens = await res.json();
  const tbody = document.getElementById("solicitacoesTabela");

  if (!Array.isArray(itens) || !itens.length) {
    tbody.innerHTML = '<tr><td colspan="6">Nenhuma solicitação encontrada.</td></tr>';
    return;
  }

  tbody.innerHTML = itens.map(item => {
    const data = item.dataReferencia || "-";
    const botaoAprovar = item.status === "Pendente"
      ? `<button class="secondary-btn small" data-id="${item.id}" data-status="Aprovada">Aprovar</button>` : "";
    const botaoReprovar = item.status === "Pendente"
      ? `<button class="secondary-btn small" data-id="${item.id}" data-status="Reprovada">Reprovar</button>` : "";

    return `<tr>
      <td>${data}</td>
      <td>${item.nomeSolicitante}</td>
      <td>${item.tipo}</td>
      <td>${item.descricao}</td>
      <td><span class="status-badge ${classeStatus(item.status)}">${item.status}</span></td>
      <td class="actions">${botaoAprovar} ${botaoReprovar}</td>
    </tr>`;
  }).join("");

  document.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => atualizarStatus(btn.dataset.id, btn.dataset.status));
  });
}

document.getElementById("btnFiltrar").addEventListener("click", carregarSolicitacoes);
carregarSolicitacoes();
