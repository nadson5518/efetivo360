const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001/api"
    : "https://efetivo360.onrender.com/api";

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
      if (data.perfil === "ADM") {
        window.location.href = "../adm/dashboard.html";
      } else {
        window.location.href = "../login/dashboard.html";
      }

    } catch (err) {
      erro.textContent = "Erro ao conectar com o servidor";
    }
});



