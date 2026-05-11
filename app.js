/**
 * APP - Controle de Voluntários (UI)
 * Vanilla JS
 * - Tela 1: departamentos + busca (filtra cards)
 * - Tela 2: voluntários do departamento + busca + registro + modal novo voluntário
 *
 * Observação:
 * Aqui os dados estão em memória (arrays/objetos) para você plugar depois no seu backend/planilha.
 */

const DATA = {
  // Se o último item era um único depto, basta trocar este array.
  departments: [
    "CAFÉ",
    "CONCIERGE",
    "CRIAÇÃO",
    "EVENTOS",
    "JUNIORES",
    "KIDS",
    "LOUVOR",
    "NEXT",
    "PRODUÇÃO",
    "UREACH",
    "USHER",
    "VIP",
    "VOLUNTÁRIOS",
    "YOUTH",
    "FACILITIES"
  ],

  // Enumerados
  presente: ["Sim", "Não"],
  justificativa: [
    "Atrasado",
    "Curso de Líderes",
    "Líder pediu para servir",
    "Justificado",
    "É Líder",
    "Troca interna",
    "Líder Fez",
    "Não estava escalado",
    "Presente s/ check-in",
    "Troca após fechamento da escala"
  ],

  // Exemplo de base local (troque pela sua fonte depois)
  volunteersByDept: {
    
"CAFÉ": [
    "Ana Ribeiro",
    "Lucas Mendes",
    "Patrícia Souza"
  ],

  "CONCIERGE": [
    "Eduardo Nogueira",
    "Renata Campos",
    "Fábio Azevedo"
  ],

  "CRIAÇÃO": [
    "Jose Santos",
    "Maria Consentino",
    "Roberto Leonardo"
  ],

  "JUNIORES": [
    "Maria Consentino",
    "João Pedro",
    "Ana Luiza"
  ],

  "KIDS": [
    "Roberto Leonardo",
    "Beatriz Lima",
    "Camila Rocha"
  ],

  "LOUVOR": [
    "Daniel Torres",
    "Marcos Vinícius",
    "Fernanda Lopes"
  ],

  "NEXT": [
    "Thiago Martins",
    "Juliana Pacheco",
    "Rafael Moreira"
  ],

  "PRODUÇÃO": [
    "André Costa",
    "Bruno Almeida",
    "Carolina Freitas"
  ],

  "UREACH": [
    "Samuel Ferreira",
    "Isabela Cunha",
    "Gustavo Rangel"
  ],

  "USHER": [
    "Paulo Henrique",
    "Vanessa Teixeira",
    "Leonardo Farias"
  ],

  "VIP": [
    "Renan Batista",
    "Camille Duarte",
    "Guilherme Prado"
  ],

  "VOLUNTÁRIOS": [
    "Cristiane Moura",
    "Felipe Rocha",
    "Natalia Guedes"
  ],

  "YOUTH": [
    "Matheus Oliveira",
    "Bianca Rezende",
    "Caio Neves"
  ],

  "Facilities": [
    "Carlos Alberto",
    "Sérgio Pimenta",
    "Márcia Helena"
  ]
}

};

// Estado simples da UI
const STATE = {
  currentDept: null,
  selectedVolunteer: null,
  presente: null,
  justificativa: "",
  obs: ""
};

// Helpers DOM
const $ = (sel) => document.querySelector(sel);

const UI = {
  init() {
    // refs
    this.screenDepartments = $("#screenDepartments");
    this.screenVolunteers = $("#screenVolunteers");

    // Tela 1
    this.deptGrid = $("#deptGrid");
    this.deptSearch = $("#deptSearch");
    this.deptEmpty = $("#deptEmpty");
    this.btnClearDeptSearch = $("#clearDeptSearch");

    // Tela 2
    this.deptTitle = $("#deptTitle");
    this.deptSubtitle = $("#deptSubtitle");
    this.btnBack = $("#btnBack");
    this.btnNewVolunteer = $("#btnNewVolunteer");
    this.volSearch = $("#volSearch");
    this.btnClearVolSearch = $("#clearVolSearch");
    this.volList = $("#volList");
    this.volEmpty = $("#volEmpty");
    this.selectedBox = $("#selectedBox");
    this.form = $("#checkinForm");
    this.justSelect = $("#justSelect");
    this.obs = $("#obs");
    this.btnPresSim = $("#btnPresSim");
    this.btnPresNao = $("#btnPresNao");
    this.btnClear = $("#btnClear");
    this.saveFeedback = $("#saveFeedback");
    this.resumeCard = $("#resumeCard");
    this.resumeText = $("#resumeText");

    // Modal
    this.modal = $("#modalNewVolunteer");
    this.newVolunteerForm = $("#newVolunteerForm");
    this.newVolName = $("#newVolName");
    this.newVolDept = $("#newVolDept");
    this.btnCancelNew = $("#btnCancelNew");

    // Toast
    this.toast = $("#toast");

    // Nav
    this.navHome = $("#navHome");
    this.navDept = $("#navDept");

    // montar UI inicial
    this.renderDeptCards(DATA.departments);

    // preencher justificativas
    this.renderJustificativas();

    // listeners - Tela 1
    this.deptSearch.addEventListener("input", () => this.filterDeptCards());
    this.btnClearDeptSearch.addEventListener("click", () => {
      this.deptSearch.value = "";
      this.filterDeptCards();
      this.deptSearch.focus();
    });

    // listeners - Tela 2
    this.btnBack.addEventListener("click", () => this.goHome());
    this.btnNewVolunteer.addEventListener("click", () => this.openNewVolunteerModal());
    this.volSearch.addEventListener("input", () => this.renderVolunteerList());
    this.btnClearVolSearch.addEventListener("click", () => {
      this.volSearch.value = "";
      this.renderVolunteerList();
      this.volSearch.focus();
    });

    // Toggle presente
    this.btnPresSim.addEventListener("click", () => this.setPresente("Sim"));
    this.btnPresNao.addEventListener("click", () => this.setPresente("Não"));

    // Form submit
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.save();
    });

    // Limpar
    this.btnClear.addEventListener("click", () => this.clearForm());

    // Modal listeners
    this.newVolunteerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.createVolunteer();
    });
    this.btnCancelNew.addEventListener("click", () => this.closeNewVolunteerModal());

    // Escape fecha modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.style.display !== "none") {
        this.closeNewVolunteerModal();
      }
    });

    // clique fora do modal fecha
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.closeNewVolunteerModal();
    });
  },

  /* ---------------------------
     TELA 1: DEPARTAMENTOS
  ---------------------------- */
  renderDeptCards(depts) {
    this.deptGrid.innerHTML = "";
    depts.forEach((dept) => {
      const card = document.createElement("div");
      card.className = "card dept-card";
      card.setAttribute("data-dept", dept.toLowerCase());
      card.innerHTML = `
        <div>
          <div class="dept-name">${dept}</div>
          <div class="dept-meta">Clique para acessar</div>
        </div>
      `;
      card.addEventListener("click", () => this.openDepartment(dept));
      this.deptGrid.appendChild(card);
    });
  },

  filterDeptCards() {
    const term = (this.deptSearch.value || "").trim().toLowerCase();
    const cards = this.deptGrid.querySelectorAll(".dept-card");
    let visible = 0;

    cards.forEach((c) => {
      const key = c.getAttribute("data-dept") || "";
      const show = term === "" ? true : key.includes(term);
      c.style.display = show ? "grid" : "none";
      if (show) visible++;
    });

    this.deptEmpty.style.display = visible === 0 ? "block" : "none";
  },

  /* ---------------------------
     Navegação / Tela 2
  ---------------------------- */
  openDepartment(dept) {
    STATE.currentDept = dept;
    STATE.selectedVolunteer = null;
    STATE.presente = null;
    STATE.justificativa = "";
    STATE.obs = "";

    this.deptTitle.textContent = dept;
    this.deptSubtitle.textContent = "Selecione um voluntário e registre a presença";

    this.volSearch.value = "";
    this.renderVolunteerList();
    this.updateSelectedBox();
    this.clearForm(false);

    this.showScreen("screenVolunteers");
    this.setNav("dept");

    this.toastMsg(`Departamento: ${dept}`);
  },

  goHome() {
    STATE.currentDept = null;
    STATE.selectedVolunteer = null;
    this.showScreen("screenDepartments");
    this.setNav("home");
  },

  showScreen(id) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    $("#" + id).classList.add("active");
  },

  setNav(which) {
    if (which === "home") {
      this.navHome.classList.add("active");
      this.navDept.classList.remove("active");
      this.navDept.textContent = "Atendimento";
    } else {
      this.navHome.classList.remove("active");
      this.navDept.classList.add("active");
      this.navDept.textContent = STATE.currentDept || "Atendimento";
    }
  },

  /* ---------------------------
     Voluntários
  ---------------------------- */
  getDeptVolunteers(dept) {
    return (DATA.volunteersByDept[dept] || []).slice().sort((a,b) => a.localeCompare(b, "pt-BR"));
  },

  renderVolunteerList() {
    const dept = STATE.currentDept;
    const all = this.getDeptVolunteers(dept);
    const term = (this.volSearch.value || "").trim().toLowerCase();

    const filtered = term
      ? all.filter(n => n.toLowerCase().includes(term))
      : all;

    this.volList.innerHTML = "";

    if (!filtered.length) {
      this.volEmpty.style.display = "block";
      return;
    }
    this.volEmpty.style.display = "none";

    filtered.forEach((name) => {
      const item = document.createElement("div");
      item.className = "vol-item";
      if (STATE.selectedVolunteer === name) item.classList.add("active");

      item.innerHTML = `
        <div class="vol-name">${name}</div>
        <div class="vol-sub">${dept}</div>
      `;

      item.addEventListener("click", () => {
        STATE.selectedVolunteer = name;
        // marcar item ativo
        this.volList.querySelectorAll(".vol-item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");

        this.updateSelectedBox();
        this.saveFeedback.textContent = "";
        this.toastMsg(`Selecionado: ${name}`);
      });

      this.volList.appendChild(item);
    });
  },

  updateSelectedBox() {
    if (!STATE.selectedVolunteer) {
      this.selectedBox.innerHTML = `<p class="hint">Nenhum voluntário selecionado.</p>`;
      return;
    }

    this.selectedBox.innerHTML = `
      <div><strong>Voluntário:</strong> ${STATE.selectedVolunteer}</div>
      <div><strong>Departamento:</strong> ${STATE.currentDept}</div>
    `;
  },

  /* ---------------------------
     Form / Enumerados
  ---------------------------- */
  renderJustificativas() {
    // first option blank
    this.justSelect.innerHTML = `<option value="">(sem justificativa)</option>`;
    DATA.justificativa.forEach((j) => {
      const opt = document.createElement("option");
      opt.value = j;
      opt.textContent = j;
      this.justSelect.appendChild(opt);
    });

    this.justSelect.addEventListener("change", () => {
      STATE.justificativa = this.justSelect.value;
    });

    this.obs.addEventListener("input", () => {
      STATE.obs = this.obs.value;
    });
  },

  setPresente(value) {
    STATE.presente = value;

    // toggle classes
    this.btnPresSim.classList.toggle("active", value === "Sim");
    this.btnPresNao.classList.toggle("active", value === "Não");
  },

  clearForm(showToast = true) {
    // mantém o voluntário selecionado; limpa somente os campos
    STATE.presente = null;
    STATE.justificativa = "";
    STATE.obs = "";

    this.btnPresSim.classList.remove("active");
    this.btnPresNao.classList.remove("active");
    this.justSelect.value = "";
    this.obs.value = "";
    this.saveFeedback.textContent = "";

    if (showToast) this.toastMsg("Campos limpos");
  },

  validate() {
    if (!STATE.currentDept) return "Selecione um departamento.";
    if (!STATE.selectedVolunteer) return "Selecione um voluntário.";
    if (!STATE.presente) return "Marque se está presente (Sim/Não).";
    // justificativa pode ser vazia, ok
    return null;
  },

  save() {
    const err = this.validate();
    if (err) {
      this.saveFeedback.textContent = "⚠ " + err;
      this.toastMsg(err, true);
      return;
    }

    // Monta payload (para plugar no backend depois)
    const payload = {
      dept: STATE.currentDept,
      volunteer: STATE.selectedVolunteer,
      presente: STATE.presente,
      justificativa: STATE.justificativa || "",
      obs: STATE.obs || "",
      timestamp: new Date().toISOString()
    };

    // Simula salvar (troque isso pelo seu fetch/integração)
    console.log("SALVAR:", payload);

    this.saveFeedback.textContent = "✅ Registro salvo com sucesso!";
    this.showResume(payload);

    this.toastMsg("Registro salvo ✅");
  },

  showResume(payload) {
    this.resumeCard.style.display = "block";
    this.resumeText.innerHTML = `
      <div><strong>${payload.volunteer}</strong> — ${payload.dept}</div>
      <div>Presente: <strong>${payload.presente}</strong></div>
      <div>Justificativa: <strong>${payload.justificativa || "-"}</strong></div>
      ${payload.obs ? `<div>Obs: <strong>${payload.obs}</strong></div>` : ""}
    `;
  },

  /* ---------------------------
     Novo voluntário (Modal)
  ---------------------------- */
  openNewVolunteerModal() {
    if (!STATE.currentDept) return;

    this.newVolName.value = "";
    this.newVolDept.value = STATE.currentDept;
    this.modal.style.display = "flex";
    setTimeout(() => this.newVolName.focus(), 50);
  },

  closeNewVolunteerModal() {
    this.modal.style.display = "none";
  },

  createVolunteer() {
    const name = (this.newVolName.value || "").trim();
    const dept = STATE.currentDept;

    if (!name) {
      this.toastMsg("Informe o nome do voluntário.", true);
      return;
    }

    // garante array
    if (!DATA.volunteersByDept[dept]) DATA.volunteersByDept[dept] = [];

    // evita duplicado exato
    const exists = DATA.volunteersByDept[dept].some(v => v.toLowerCase() === name.toLowerCase());
    if (exists) {
      this.toastMsg("Esse voluntário já existe nesse departamento.", true);
      return;
    }

    DATA.volunteersByDept[dept].push(name);

    this.closeNewVolunteerModal();
    this.renderVolunteerList();

    // auto-seleciona o recém-criado
    STATE.selectedVolunteer = name;
    this.updateSelectedBox();
    this.toastMsg("Voluntário criado ✅");

    // marca item ativo na lista (após render)
    const items = this.volList.querySelectorAll(".vol-item");
    items.forEach((el) => {
      const n = el.querySelector(".vol-name")?.textContent || "";
      el.classList.toggle("active", n === name);
    });
  },

  /* ---------------------------
     Toast
  ---------------------------- */
  toastMsg(msg, isError = false) {
    this.toast.textContent = (isError ? "⚠ " : "") + msg;
    this.toast.style.background = isError ? "#991b1b" : "#111827";
    this.toast.classList.add("show");

    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toast.classList.remove("show");
    }, 2200);
  }
};

// expõe UI para usar no nav
window.UI = UI;

// start
document.addEventListener("DOMContentLoaded", () => UI.init());
