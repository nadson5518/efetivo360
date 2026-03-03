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
  document.getElementById("metaUserNome").textContent = usuario.nome;
}

function renderMeta(meta) {
  const percentual = meta.valorMeta > 0 ? Math.min(100, Math.round((meta.valorAtual / meta.valorMeta) * 100)) : 0;
  const classe = percentual >= 80 ? "success" : percentual >= 50 ? "warning" : "danger";
  return `
    <div class="goal-card">
      <div class="goal-header">
        <div>
          <strong>${meta.titulo}</strong>
          <span class="goal-info">${meta.periodo} • ${meta.disciplina || "Sem disciplina"}</span>
        </div>
        <span class="goal-percent ${classe}">${percentual}%</span>
      </div>
      <div class="goal-progress">
        <div class="progress-bar"><div class="progress-fill ${classe}" style="width:${percentual}%"></div></div>
        <div class="goal-values"><span>Atual: ${meta.valorAtual}</span><span>Meta: ${meta.valorMeta}</span></div>
      </div>
    </div>`;
}

async function carregarMetas() {
  const lista = document.getElementById("metasLista");
  const res = await fetch(`${API_URL}/auth/metas?matricula=${encodeURIComponent(usuario.matricula)}`);
  const metas = await res.json();
  if (!Array.isArray(metas) || !metas.length) {
    lista.innerHTML = '<p class="subtitle">Nenhuma meta cadastrada.</p>';
    return;
  }
  lista.innerHTML = metas.map(renderMeta).join("");
}

document.getElementById("metaCancelar").addEventListener("click", () => {
  document.getElementById("metaForm").reset();
});

document.getElementById("metaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    matricula: usuario.matricula,
    titulo: document.getElementById("metaTitulo").value.trim(),
    periodo: document.getElementById("metaPeriodo").value,
    valorMeta: Number(document.getElementById("metaValor").value),
    valorAtual: Number(document.getElementById("metaAtual").value || 0)
  };

  const res = await fetch(`${API_URL}/auth/metas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.erro || "Erro ao cadastrar meta.");
    return;
  }

  e.target.reset();
  await carregarMetas();
});

carregarMetas();
