const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001/api"
    : "https://efetivo360.onrender.com/api";

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
    } else if (data.perfil === "ADM") {
      window.location.href = "../adm/dashboard.html";
    } else {
      window.location.href = "../login/dashboard.html";
    }

  } catch (err) {
    erro.textContent = "Erro ao conectar com o servidor";
  }
});


