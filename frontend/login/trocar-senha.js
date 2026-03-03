const API_URL = obterApiUrl();

function obterApiUrl() {
  if (window.__API_URL) return window.__API_URL;

  const host = window.location.hostname;
  const origin = window.location.origin;
  const isLocalHost = host === "localhost" || host === "127.0.0.1";

  if (isLocalHost) {
    if (window.location.port === "3001") {
      return `${origin}/api`;
    }

    return "http://localhost:3001/api";
  }

  return `${origin}/api`;
}

function obterRotaPorPerfil(perfil) {
  if (perfil === "ADM") return "../adm/dashboard.html";
  if (perfil === "Lider") return "lider-painel.html";
  return "dashboard.html";
}

const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
  window.location.href = "index.html";
}

document
  .getElementById("trocarSenhaForm")
  .addEventListener("submit", async (e) => {

    e.preventDefault();

    const novaSenha = document.getElementById("novaSenha").value;
    const confirmar = document.getElementById("confirmarSenha").value;
    const erro = document.getElementById("erro");

    erro.textContent = "";

    if (novaSenha !== confirmar) {
      erro.textContent = "As senhas não conferem";
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/trocar-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricula: usuario.matricula,
          novaSenha
        })
      });

      const data = await response.json();

      if (!response.ok) {
        erro.textContent = data.erro || "Erro ao trocar senha";
        return;
      }

      // Atualiza localStorage
      usuario.primeiroAcesso = false;
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Redireciona
      window.location.href = obterRotaPorPerfil(data.perfil || usuario.perfil);

    } catch (err) {
      erro.textContent = "Erro ao conectar com o servidor";
    }
});
