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
if (usuario) document.getElementById("ajusteUserNome").textContent = usuario.nome;

document.getElementById("ajusteData").valueAsDate = new Date();

document.getElementById("ajusteCancelar").addEventListener("click", () => {
  window.location.href = "lider-painel.html";
});

document.getElementById("ajusteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    matricula: usuario.matricula,
    tipo: "Ajuste de Horário",
    dataReferencia: document.getElementById("ajusteData").value,
    descricao: document.getElementById("ajusteDescricao").value.trim(),
    detalhes: {
      colaborador: document.getElementById("ajusteColaborador").value.trim(),
      horarioLancado: document.getElementById("ajusteHorarioLancado").value.trim(),
      tipoAjuste: document.getElementById("ajusteTipo").value,
      entradaCorreta: document.getElementById("ajusteEntradaCorreta").value,
      saidaCorreta: document.getElementById("ajusteSaidaCorreta").value,
      statusCorreto: document.getElementById("ajusteStatus").value,
      motivoParalisacao: document.getElementById("ajusteMotivoParalisacao").value
    }
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

  alert("Solicitação enviada com sucesso.");
  window.location.href = "solicitacoes.html";
});
