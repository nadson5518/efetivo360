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

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const matricula = document.getElementById("matricula").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("erro");

  erro.textContent = "";

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricula, senha })
    });

    const data = await response.json();

    if (!response.ok) {
      erro.textContent = data.erro || "Erro no login";
      return;
    }

    localStorage.setItem("usuario", JSON.stringify(data));

    if (data.primeiroAcesso) {
      window.location.href = "trocar-senha.html";
    } else {
      window.location.href = obterRotaPorPerfil(data.perfil);
    }

  } catch (err) {
    erro.textContent = "Erro ao conectar com o servidor";
  }
});
