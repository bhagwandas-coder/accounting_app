// ---- Simple Case Manager (GitHub Pages friendly) ----
// All data is saved in the browser's localStorage (works without a backend)

const LS_KEY = "accountrack_cases";

// helpers
const getCases = () => JSON.parse(localStorage.getItem(LS_KEY) || "[]");
const setCases = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));
const uid = () => "case_" + Math.random().toString(36).slice(2) + Date.now();

// DOM
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// views
const clientView = $("#client-view");
const adminView  = $("#admin-view");

// sections
const clientCasesList = $("#client-cases-list");
const adminCasesList  = $("#admin-cases-list");

// filters
const clientSearch = $("#client-case-search");
const clientStatusFilter = $("#client-status-filter");
const adminSearch  = $("#admin-case-search");
const adminStatusFilter = $("#admin-status-filter");
const adminPriorityFilter = $("#admin-priority-filter");

// modal
const modal = $("#case-modal");
const modalCloseBtns = $$(".modal-close");

// nav tabs
$$(".nav-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".nav-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const view = btn.dataset.view;
    if (view === "client") {
      clientView.classList.add("active");
      adminView.classList.remove("active");
    } else {
      adminView.classList.add("active");
      clientView.classList.remove("active");
      renderAdmin(); // keep admin fresh
    }
  });
});

// sub-nav (client + admin sections)
$$(".sub-nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const container = btn.closest(".view-container");
    container.querySelectorAll(".sub-nav-btn").forEach(b => b.classList.remove("active"));
    container.querySelectorAll(".content-section").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    container.querySelector(`#${btn.dataset.section}-section`).classList.add("active");
  });
});

// ---- Create Case (Client form) ----
const newCaseForm = $("#new-case-form");
if (newCaseForm) {
  newCaseForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const caseObj = {
      id: uid(),
      createdAt: new Date().toISOString(),
      status: "pending",
      priority: $("#case-priority").value || "medium",
      type: $("#case-type").value || "",
      client: {
        name: $("#client-name").value.trim(),
        email: $("#client-email").value.trim(),
        phone: $("#client-phone").value.trim(),
        company: $("#company-name").value.trim(),
      },
      description: $("#case-description").value.trim(),
      tasks: [],
      attachments: [],
      messages: []
    };

    // very basic validation
    if (!caseObj.client.name || !caseObj.client.email || !caseObj.client.phone || !caseObj.type || !caseObj.description) {
      notify("Please fill all required fields.", true);
      return;
    }

    const cases = getCases();
    cases.push(caseObj);
    setCases(cases);

    newCaseForm.reset();
    notify("Case created successfully.");
    renderClient();
    renderAdmin();
  });
}

// ---- Renders ----
function renderClient() {
  const query = (clientSearch?.value || "").toLowerCase();
  const status = clientStatusFilter?.value || "";

  let cases = getCases();
  cases = cases.filter(c =>
    (!status || c.status === status) &&
    (
      c.client.name.toLowerCase().includes(query) ||
      c.client.email.toLowerCase().includes(query) ||
      c.client.company.toLowerCase().includes(query)
    )
  );

  if (!clientCasesList) return;
  clientCasesList.innerHTML = cases.length
    ? cases.map(cardHTML).join("")
    : emptyHTML("No cases yet. Use “New Case” to create one.");
}

function renderAdmin() {
  const q = (adminSearch?.value || "").toLowerCase();
  const st = adminStatusFilter?.value || "";
  const pr = adminPriorityFilter?.value || "";

  let cases = getCases();
  cases = cases.filter(c =>
    (!st || c.status === st) &&
    (!pr || c.priority === pr) &&
    (
      c.client.name.toLowerCase().includes(q) ||
      c.client.email.toLowerCase().includes(q) ||
      c.client.company.toLowerCase().includes(q) ||
      (c.type || "").toLowerCase().includes(q)
    )
  );

  if (!adminCasesList) return;
  if (!cases.length) {
    adminCasesList.innerHTML = emptyHTML("No cases found.");
    return;
  }

  adminCasesList.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>Created</th><th>Client</th><th>Service</th>
          <th>Priority</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${cases.map(rowHTML).join("")}
      </tbody>
    </table>
  `;

  // bind row actions
  adminCasesList.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === "view") openCase(id);
      if (action === "delete") deleteCase(id);
      if (action === "complete") setStatus(id, "completed");
    });
  });
}

// ---- HTML helpers ----
function cardHTML(c) {
  return `
    <div class="case-card">
      <div class="case-card__top">
        <strong>${escapeHtml(c.client.name)}</strong>
        <span class="badge">${escapeHtml(c.status)}</span>
      </div>
      <div class="case-card__meta">
        <span>${escapeHtml(c.client.email)}</span>
        <span>${escapeHtml(c.client.company || "-")}</span>
        <span>${escapeHtml(c.type || "-")} • ${escapeHtml(c.priority)}</span>
      </div>
      <div class="case-card__actions">
        <button class="btn btn-sm" onclick="openCase('${c.id}')">Open</button>
      </div>
    </div>
  `;
}

function rowHTML(c) {
  const d = new Date(c.createdAt).toLocaleString();
  return `
    <tr>
      <td>${d}</td>
      <td>${escapeHtml(c.client.name)}<br><small>${escapeHtml(c.client.email)}</small></td>
      <td>${escapeHtml(c.type || "-")}</td>
      <td>${escapeHtml(c.priority)}</td>
      <td>${escapeHtml(c.status)}</td>
      <td>
        <button class="btn btn-sm" data-action="view" data-id="${c.id}">View</button>
        <button class="btn btn-sm" data-action="complete" data-id="${c.id}">Mark Complete</button>
        <button class="btn btn-sm btn-danger" data-action="delete" data-id="${c.id}">Delete</button>
      </td>
    </tr>
  `;
}

function emptyHTML(text) {
  return `
    <div class="empty-state">
      <i class="fas fa-folder-open"></i>
      <p>${escapeHtml(text)}</p>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// ---- Case actions ----
window.openCase = function(id) {
  const c = getCases().find(x => x.id === id);
  if (!c) return;

  $("#modal-case-title").textContent = `Case: ${c.client.name}`;
  $("#modal-case-info").innerHTML = `
    <div class="grid">
      <div><strong>Client:</strong> ${escapeHtml(c.client.name)}</div>
      <div><strong>Email:</strong> ${escapeHtml(c.client.email)}</div>
      <div><strong>Phone:</strong> ${escapeHtml(c.client.phone)}</div>
      <div><strong>Company:</strong> ${escapeHtml(c.client.company || "-")}</div>
      <div><strong>Service:</strong> ${escapeHtml(c.type || "-")}</div>
      <div><strong>Priority:</strong> ${escapeHtml(c.priority)}</div>
      <div><strong>Status:</strong> ${escapeHtml(c.status)}</div>
      <div><strong>Created:</strong> ${new Date(c.createdAt).toLocaleString()}</div>
      <div class="full"><strong>Description:</strong><br>${escapeHtml(c.description)}</div>
    </div>
  `;
  modal.classList.add("open");
};

function deleteCase(id) {
  const remaining = getCases().filter(c => c.id !== id);
  setCases(remaining);
  renderClient(); renderAdmin();
  notify("Case deleted.");
}

function setStatus(id, status) {
  const cases = getCases();
  const c = cases.find(x => x.id === id);
  if (!c) return;
  c.status = status;
  setCases(cases);
  renderClient(); renderAdmin();
}

// modal close
modalCloseBtns.forEach(btn => btn.addEventListener("click", () => modal.classList.remove("open")));
modal?.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("open");
});

// filters listeners
clientSearch?.addEventListener("input", renderClient);
clientStatusFilter?.addEventListener("change", renderClient);
adminSearch?.addEventListener("input", renderAdmin);
adminStatusFilter?.addEventListener("change", renderAdmin);
adminPriorityFilter?.addEventListener("change", renderAdmin);

// toast
function notify(msg, isError = false) {
  const n = $("#notification");
  if (!n) return;
  n.textContent = msg;
  n.classList.toggle("error", !!isError);
  n.classList.add("show");
  setTimeout(() => n.classList.remove("show"), 2200);
}

// init
renderClient();
renderAdmin();
// after: setCases(cases); newCaseForm.reset(); notify("Case created successfully.");
renderClient();
renderAdmin();

// 👉 automatically switch to "My Cases"
document.querySelector('[data-section="my-cases"]')?.click();

// 👉 also pre-render admin when user clicks "Admin Dashboard"
document.querySelector('.nav-tab[data-view="admin"]')
  ?.addEventListener('click', () => renderAdmin());

