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
let editandoId = null;

// ELEMENTOS
const modal = document.getElementById("modalUsuario");
const perfil = document.getElementById("perfil");
const disciplina = document.getElementById("disciplina");
const funcao = document.getElementById("funcao");
const lider = document.getElementById("lider");

const disciplinaGroup = document.getElementById("disciplinaGroup");
const funcaoGroup = document.getElementById("funcaoGroup");
const liderGroup = document.getElementById("liderGroup");

// BOTÕES
document.getElementById("btnNovoUsuario").onclick = () => abrirModal();
document.getElementById("btnCancelar").onclick = () => modal.style.display = "none";

// PERFIL → CONTROLE DE CAMPOS
perfil.addEventListener("change", () => {
  disciplinaGroup.style.display = perfil.value !== "ADM" ? "block" : "none";
  funcaoGroup.style.display = perfil.value === "Colaborador" ? "block" : "none";
  liderGroup.style.display = perfil.value === "Colaborador" ? "block" : "none";
});

// DISCIPLINA → LÍDERES
disciplina.addEventListener("change", carregarLideres);

async function carregarLideres() {
  lider.innerHTML = `<option value="">Selecione o líder</option>`;
  if (!disciplina.value) return;

  const res = await fetch(`${API_URL}/auth/lideres?disciplina=${disciplina.value}`);
  const dados = await res.json();

  dados.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l.id;
    opt.textContent = l.nome;
    lider.appendChild(opt);
  });
}

// LISTAR USUÁRIOS
async function carregarUsuarios() {
  const res = await fetch(`${API_URL}/auth/usuarios`);
  const usuarios = await res.json();
  const tabela = document.getElementById("usuariosTabela");

  tabela.innerHTML = "";

  usuarios.forEach(u => {
    tabela.innerHTML += `
      <tr>
        <td>${u.matricula}</td>
        <td>${u.nome}</td>
        <td>${u.disciplina || "-"}</td>
        <td>${u.funcao || "-"}</td>
        <td>${u.perfil}</td>
        <td>
          <span class="status-badge ${u.status === "Ativo" ? "ativo" : "inativo"}">
            ${u.status}
          </span>
        </td>
        <td class="actions">
          <span onclick='editarUsuario(${JSON.stringify(u)})'>✏️</span>
          <span onclick='alterarStatus("${u.id}")'>🔁</span>
        </td>
      </tr>
    `;
  });
}

// ABRIR MODAL
function abrirModal(usuario = null) {
  modal.style.display = "flex";
  document.getElementById("usuarioForm").reset();
  document.getElementById("mensagem").textContent = "";
  editandoId = null;

  document.getElementById("matricula").disabled = false;

  if (usuario) {
    editandoId = usuario.id;
    document.getElementById("nome").value = usuario.nome;
    document.getElementById("matricula").value = usuario.matricula;
    document.getElementById("matricula").disabled = true;
    perfil.value = usuario.perfil;
    disciplina.value = usuario.disciplina || "";
    funcao.value = usuario.funcao || "";

    perfil.dispatchEvent(new Event("change"));
    carregarLideres().then(() => {
      lider.value = usuario.liderId || "";
    });
  }
}

// EDITAR
function editarUsuario(usuario) {
  abrirModal(usuario);
}

// SALVAR
document.getElementById("usuarioForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nome: document.getElementById("nome").value,
    matricula: document.getElementById("matricula").value,
    perfil: perfil.value,
    disciplina: disciplina.value,
    funcao: funcao.value,
    liderId: lider.value
  };

  const url = editandoId
    ? `${API_URL}/auth/usuarios/${editandoId}`
    : `${API_URL}/auth/usuarios`;

  const method = editandoId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    document.getElementById("mensagem").textContent = data.erro;
    return;
  }

  modal.style.display = "none";
  carregarUsuarios();
});

// STATUS
async function alterarStatus(id) {
  if (!confirm("Deseja alterar o status deste usuário?")) return;

  await fetch(`${API_URL}/auth/usuarios/${id}/status`, { method: "PATCH" });
  carregarUsuarios();
}

// INIT
carregarUsuarios();
