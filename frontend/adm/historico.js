const API_URL = obterApiUrl();

function obterApiUrl() {
  if (window.__API_URL) return window.__API_URL;
  const host = window.location.hostname;
  const origin = window.location.origin;
  const isLocalHost = host === "localhost" || host === "127.0.0.1";

  if (isLocalHost) {
    if (window.location.port === "3001") return `${origin}/api`;
    return "http://localhost:3001/api";
  }

  return `${origin}/api`;
}

const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario || usuario.perfil !== "ADM") {
  window.location.href = "../login/index.html";
}

const tbody = document.querySelector("#historicoTable tbody");
const criticalToggle = document.getElementById("onlyCritical");
const tipoSelect = document.getElementById("filtroTipo");
let historico = [];

function badgeByCriticidade(criticidade) {
  if (criticidade === "critico") return '<span class="badge critical">Crítico</span>';
  if (criticidade === "atencao") return '<span class="badge warning">Atenção</span>';
  return '<span class="badge normal">Info</span>';
}

function render() {
  const tipo = (tipoSelect?.value || "").toLowerCase();
  const onlyCritical = !!criticalToggle?.checked;

  const rows = historico.filter(item => {
    const matchesTipo = !tipo || item.evento.toLowerCase().includes(tipo);
    const matchesCritical = !onlyCritical || item.criticidade === "critico";
    return matchesTipo && matchesCritical;
  });

  tbody.innerHTML = "";

  rows.forEach(item => {
    tbody.innerHTML += `
      <tr class="event-${item.criticidade === "critico" ? "critical" : "normal"}">
        <td>${item.data} ${item.hora || ""}</td>
        <td>${item.evento} ${badgeByCriticidade(item.criticidade || "normal")}</td>
        <td>${item.lancado_por || "-"}</td>
        <td>${item.aprovado_por || "—"}</td>
        <td>${item.descricao || "-"}</td>
        <td>${item.detalhes || "-"}</td>
      </tr>
    `;
  });
}

async function carregarHistorico() {
  const res = await fetch(`${API_URL}/auth/historico?perfil=ADM&matricula=${usuario.matricula}`);
  const data = await res.json();

  historico = Array.isArray(data) ? data : [];
  render();
}

criticalToggle?.addEventListener("change", render);
tipoSelect?.addEventListener("change", render);

carregarHistorico();
