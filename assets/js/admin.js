const SUPABASE_URL = "https://ueemeutfuoiecsgtsfac.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_x4bzOZ1xNzdzLmzn0UUzmw_oOCxOtWF";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = (id) => document.getElementById(id);
const authStatus = $("auth-status");
const adminApp = $("admin-app");
const signOutBtn = $("sign-out");

function msg(t) { authStatus.textContent = t; }
function esc(v = "") { return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }

async function refreshSession() {
  const { data: { session } } = await sb.auth.getSession();
  const on = !!session;
  adminApp.style.display = on ? "block" : "none";
  signOutBtn.style.display = on ? "inline-block" : "none";
  msg(on ? `Signed in as ${session.user.email}` : "Signed out");
  if (on) await Promise.all([loadAboutAdmin(), loadEducationAdmin(), loadExperienceAdmin(), loadProjectsAdmin(), loadMusicAdmin(), loadFeedback()]);
}

$("sign-in").addEventListener("click", async () => {
  const email = $("email").value.trim();
  const password = $("password").value;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  msg(error ? error.message : "Signed in");
  await refreshSession();
});

$("sign-up").addEventListener("click", async () => {
  const email = $("email").value.trim();
  const password = $("password").value;
  const { error } = await sb.auth.signUp({ email, password });
  msg(error ? error.message : "Admin user created. If email confirmation is enabled, confirm it first.");
});

signOutBtn.addEventListener("click", async () => {
  await sb.auth.signOut();
  await refreshSession();
});

async function loadAboutAdmin() {
  const { data } = await sb.from("about").select("*").eq("id", 1).maybeSingle();
  if (!data) return;
  $("about-image").value = data.image || "";
  $("about-description").value = data.description || "";
  $("about-skills").value = data.skills || "";
  $("about-cv").value = data.cv_link || "";
}

$("save-about").addEventListener("click", async () => {
  const payload = { id: 1, image: $("about-image").value.trim(), description: $("about-description").value.trim(), skills: $("about-skills").value.trim(), cv_link: $("about-cv").value.trim() };
  const { error } = await sb.from("about").upsert(payload);
  msg(error ? error.message : "About saved");
});

async function renderEditableList(targetId, rows, fields, table, loaders) {
  const root = $(targetId);
  root.innerHTML = rows.map((row) => {
    const inputs = fields.map((f) => `<input data-field="${f}" value="${esc(row[f] ?? "")}" />`).join("");
    return `<div class="item" data-id="${row.id}">${inputs}<div class="actions"><button data-action="save">Save</button><button data-action="delete">Delete</button></div></div>`;
  }).join("");

  root.querySelectorAll(".item").forEach((item) => {
    item.querySelector('[data-action="save"]').addEventListener('click', async () => {
      const id = Number(item.dataset.id);
      const payload = { id };
      item.querySelectorAll('input').forEach((inp) => payload[inp.dataset.field] = inp.value.trim());
      const { error } = await sb.from(table).upsert(payload);
      msg(error ? error.message : `${table} item saved`);
      await loaders();
    });
    item.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      const id = Number(item.dataset.id);
      const { error } = await sb.from(table).delete().eq('id', id);
      msg(error ? error.message : `${table} item deleted`);
      await loaders();
    });
  });
}

async function loadEducationAdmin() {
  const { data } = await sb.from("education").select("*").order("id");
  await renderEditableList("education-admin-list", data || [], ["tittle","institute","data_range","description"], "education", loadEducationAdmin);
}
$("add-education").addEventListener("click", async () => {
  const payload = { tittle: $("education-title").value.trim(), institute: $("education-institute").value.trim(), data_range: $("education-range").value.trim(), description: $("education-description").value.trim() };
  const { error } = await sb.from("education").insert(payload);
  msg(error ? error.message : "Education added");
  await loadEducationAdmin();
});

async function loadExperienceAdmin() {
  const { data } = await sb.from("experience").select("*").order("id");
  await renderEditableList("experience-admin-list", data || [], ["title","company","data_range","description"], "experience", loadExperienceAdmin);
}
$("add-experience").addEventListener("click", async () => {
  const payload = { title: $("experience-title").value.trim(), company: $("experience-company").value.trim(), data_range: $("experience-range").value.trim(), description: $("experience-description").value.trim() };
  const { error } = await sb.from("experience").insert(payload);
  msg(error ? error.message : "Experience added");
  await loadExperienceAdmin();
});

async function loadProjectsAdmin() {
  const { data } = await sb.from("projects").select("*").order("id");
  await renderEditableList("projects-admin-list", data || [], ["title","image","weblink","demolink","description"], "projects", loadProjectsAdmin);
}
$("add-project").addEventListener("click", async () => {
  const payload = { title: $("project-title").value.trim(), image: $("project-image").value.trim(), weblink: $("project-weblink").value.trim(), demolink: $("project-demolink").value.trim(), description: $("project-description").value.trim() };
  const { error } = await sb.from("projects").insert(payload);
  msg(error ? error.message : "Project added");
  await loadProjectsAdmin();
});

async function loadMusicAdmin() {
  const { data } = await sb.from("music").select("*").order("id");
  await renderEditableList("music-admin-list", data || [], ["title","link"], "music", loadMusicAdmin);
}
$("add-music").addEventListener("click", async () => {
  const payload = { title: $("music-title").value.trim(), link: $("music-link").value.trim() };
  const { error } = await sb.from("music").insert(payload);
  msg(error ? error.message : "Playlist added");
  await loadMusicAdmin();
});

async function loadFeedback() {
  const { data } = await sb.from("feedback").select("*").order("created_at", { ascending: false }).limit(50);
  $("feedback-list").innerHTML = (data || []).map((row) => `<div class="item"><strong>${esc(row.subject)}</strong><br>${esc(row.name)} · ${esc(row.email)}<br>${esc(row.description)}<br><span class="muted">${esc(row.created_at || "")}</span></div>`).join("") || '<p class="muted">No feedback yet.</p>';
}

sb.auth.onAuthStateChange(() => { refreshSession(); });
refreshSession();
