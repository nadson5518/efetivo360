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
if (!usuario) {
  window.location.href = "index.html";
}

const botaoSalvar = document.getElementById("btnSalvarProducao");
const botaoCancelar = document.getElementById("btnCancelarProducao");

const campoData = document.getElementById("prodData");
if (campoData && !campoData.value) {
  const hoje = new Date().toISOString().split("T")[0];
  campoData.value = hoje;
}


botaoCancelar?.addEventListener("click", () => {
  window.location.href = "lider-painel.html";
});

botaoSalvar?.addEventListener("click", async () => {
  const payload = {
    matricula: usuario.matricula,
    data: document.getElementById("prodData")?.value,
    grupo: document.getElementById("prodGrupo")?.value,
    atividade: document.getElementById("prodAtividade")?.value,
    quantidade: document.getElementById("prodQuantidade")?.value,
    unidade: document.getElementById("prodUnidade")?.value,
    observacao: document.getElementById("prodObservacao")?.value
  };

  if (!payload.data || !payload.grupo || !payload.atividade || !payload.quantidade) {
    alert("Preencha data, grupo, atividade e quantidade.");
    return;
  }

  const res = await fetch(`${API_URL}/auth/producao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.erro || "Erro ao salvar produção");
    return;
  }

  alert("Produção registrada com sucesso");
  window.location.href = "historico.html";
});
