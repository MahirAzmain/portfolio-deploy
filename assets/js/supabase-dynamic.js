const SUPABASE_URL = "https://ueemeutfuoiecsgtsfac.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_x4bzOZ1xNzdzLmzn0UUzmw_oOCxOtWF";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.innerHTML = value;
}

function setAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el && value) el.setAttribute(attr, value);
}

async function loadAbout() {
  const { data, error } = await supabaseClient
    .from("about")
    .select("image, description, skills, cv_link")
    .eq("id", 1)
    .single();

  if (error || !data) return;

  setAttr("about-image", "src", data.image || "assets/img/about-perfil.jpg");
  setText("about-description", escapeHtml(data.description || ""));
  setText("about-skills", `<b>My Skills Are:</b> ${escapeHtml(data.skills || "")}`);
  setAttr("about-cv-link", "href", data.cv_link || "assets/cv/CV_2024030410050372.pdf");
}

async function loadEducation() {
  const { data, error } = await supabaseClient
    .from("education")
    .select("tittle, institute, data_range, description")
    .order("id", { ascending: true });

  if (error || !data?.length) return;

  const el = document.getElementById("education-list");
  el.innerHTML = data.map((row) => `
    <div class="item izq">
      <h4>${escapeHtml(row.tittle)}</h4>
      <span class="casa">${escapeHtml(row.institute)}</span>
      <span class="fecha">${escapeHtml(row.data_range)}</span>
      <p>${escapeHtml(row.description)}</p>
      <div class="conectori"><div class="circuloi"></div></div>
    </div>
  `).join("");
}

async function loadExperience() {
  const { data, error } = await supabaseClient
    .from("experience")
    .select("title, company, data_range, description")
    .order("id", { ascending: true });

  if (error || !data?.length) return;

  const el = document.getElementById("experience-list");
  el.innerHTML = data.map((row) => `
    <div class="item der">
      <h4>${escapeHtml(row.title)}</h4>
      <span class="casa">${escapeHtml(row.company)}</span>
      <span class="fecha">${escapeHtml(row.data_range)}</span>
      <p>${escapeHtml(row.description)}</p>
      <div class="conectord"><div class="circulod"></div></div>
    </div>
  `).join("");
}

async function loadProjects() {
  const { data, error } = await supabaseClient
    .from("projects")
    .select("image, title, description, weblink, demolink")
    .order("id", { ascending: true });

  if (error || !data?.length) return;

  const el = document.getElementById("projects-list");
  el.innerHTML = data.map((row) => {
    const image = row.image || "assets/img/art-store-eta.webp";
    const safeImage = image.startsWith("http") ? image : image;
    const weblink = row.weblink || "https://github.com/MahirAzmain";
    const demolink = row.demolink || weblink;
    return `
      <article class="projects__card">
        <a href="${escapeHtml(weblink)}" target="_blank" class="projects__link">
          <div class="projects__image">
            <img src="${escapeHtml(safeImage)}" alt="${escapeHtml(row.title)}" class="projects__img" />
            <a href="${escapeHtml(weblink)}" target="_blank" class="projects__button button">
              <i class="ri-arrow-right-up-line"></i>
            </a>
          </div>
        </a>
        <div class="projects__content">
          <h3 class="projects__subtitle">Website</h3>
          <h2 class="projects__title">${escapeHtml(row.title)}</h2>
          <p class="projects__description">${escapeHtml(row.description)}</p>
        </div>
        <a href="${escapeHtml(demolink)}" target="_blank" class="projects__demo button">
          <i class="ri-layout-6-line"></i> Live Demo
        </a>
      </article>
    `;
  }).join("");
}

async function loadMusic() {
  const { data, error } = await supabaseClient
    .from("music")
    .select("title, link")
    .order("id", { ascending: true });

  if (error || !data?.length) return;

  const el = document.getElementById("music-list");
  el.innerHTML = data.map((row, idx) => `
    <div class="music__box" id="music-box-${idx + 1}">
      <iframe title="${escapeHtml(row.title || `Playlist ${idx + 1}`)}" style="border-radius: 12px" src="${escapeHtml(row.link)}" width="100%" height="410" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    </div>
  `).join("");
}

async function handleContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-status");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Sending...";

    const payload = {
      name: form.user_name.value.trim(),
      email: form.user_email.value.trim(),
      subject: form.user_subject.value.trim(),
      description: form.user_message.value.trim(),
    };

    const { error } = await supabaseClient.from("feedback").insert(payload);

    if (error) {
      status.textContent = "Could not send message yet. Please check Supabase table/RLS setup.";
      return;
    }

    form.reset();
    status.textContent = "Message sent successfully.";
  });
}

async function initDynamicPortfolio() {
  await Promise.allSettled([
    loadAbout(),
    loadEducation(),
    loadExperience(),
    loadProjects(),
    loadMusic(),
  ]);
  handleContactForm();
}

document.addEventListener("DOMContentLoaded", initDynamicPortfolio);
