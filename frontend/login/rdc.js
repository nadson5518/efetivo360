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

const botaoSalvar = document.getElementById("btnSalvarRdc");
const botaoCancelar = document.getElementById("btnCancelarRdc");

botaoCancelar?.addEventListener("click", () => {
  window.location.href = "lider-painel.html";
});

botaoSalvar?.addEventListener("click", async () => {
  const payload = {
    matricula: usuario.matricula,
    data: document.getElementById("rdcData")?.value,
    frenteTrabalho: document.getElementById("rdcFrente")?.value,
    clima: document.getElementById("rdcClima")?.value,
    ocorrencias: document.getElementById("rdcOcorrencias")?.value,
    atividades: document.getElementById("rdcAtividades")?.value
  };

  if (!payload.data || !payload.frenteTrabalho || !payload.atividades) {
    alert("Preencha data, frente de trabalho e atividades.");
    return;
  }

  const res = await fetch(`${API_URL}/auth/rdc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.erro || "Erro ao salvar RDC");
    return;
  }

  alert("RDC salvo com sucesso");
  window.location.href = "historico.html";
});
