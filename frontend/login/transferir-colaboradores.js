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
if (usuario) document.getElementById("transferUserNome").textContent = usuario.nome;

async function transferir(id, acao) {
  const res = await fetch(`${API_URL}/auth/colaboradores/${id}/transferir`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matriculaLider: usuario.matricula, acao })
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.erro || "Erro ao transferir colaborador");
    return;
  }

  await carregarListas();
}

function itemTemplate(colaborador, acao) {
  const textoAcao = acao === "adicionar" ? "➕ Adicionar" : "➖ Remover";
  const classe = acao === "adicionar" ? "add" : "remove";
  return `<li>${colaborador.nome} (${colaborador.matricula}) <button class="action-btn ${classe}" data-id="${colaborador.id}" data-acao="${acao}">${textoAcao}</button></li>`;
}

async function carregarListas() {
  const [resDisp, resEquipe] = await Promise.all([
    fetch(`${API_URL}/auth/colaboradores-disponiveis?matricula=${encodeURIComponent(usuario.matricula)}`),
    fetch(`${API_URL}/auth/equipe?matricula=${encodeURIComponent(usuario.matricula)}`)
  ]);

  const disponiveis = await resDisp.json();
  const equipe = await resEquipe.json();

  const listaDisponiveis = document.getElementById("listaDisponiveis");
  const listaEquipe = document.getElementById("listaEquipe");

  listaDisponiveis.innerHTML = Array.isArray(disponiveis) && disponiveis.length
    ? disponiveis.map(c => itemTemplate(c, "adicionar")).join("")
    : "<li>Sem colaboradores disponíveis.</li>";

  listaEquipe.innerHTML = Array.isArray(equipe) && equipe.length
    ? equipe.map(c => itemTemplate(c, "remover")).join("")
    : "<li>Sua equipe ainda está vazia.</li>";

  document.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => transferir(btn.dataset.id, btn.dataset.acao));
  });
}

carregarListas();
