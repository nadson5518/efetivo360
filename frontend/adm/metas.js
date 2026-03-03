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

function percentual(atual, meta) {
  if (!meta) return 0;
  return Math.min(100, Math.round((atual / meta) * 100));
}

async function carregarMetas() {
  const res = await fetch(`${API_URL}/auth/metas?perfil=ADM`);
  const metas = await res.json();
  const tbody = document.getElementById("metasTabela");
  if (!Array.isArray(metas) || !metas.length) {
    tbody.innerHTML = '<tr><td colspan="7">Nenhuma meta cadastrada.</td></tr>';
    return;
  }

  tbody.innerHTML = metas.map(meta => {
    const perc = percentual(meta.valorAtual, meta.valorMeta);
    return `<tr>
      <td>${meta.titulo}</td>
      <td>${meta.disciplina || "-"}</td>
      <td>${meta.lider || "-"}</td>
      <td>${meta.periodo}</td>
      <td>${meta.valorMeta}</td>
      <td>${meta.valorAtual}</td>
      <td>
        <div class="progress-bar"><div class="progress" style="width:${perc}%">${perc}%</div></div>
      </td>
    </tr>`;
  }).join("");
}

carregarMetas();
