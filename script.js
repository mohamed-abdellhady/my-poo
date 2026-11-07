/* MY POO — 365 Reasons
   All 365 notes are open from the first visit.
   Edit any note from its card using the pencil button.
*/
const reasons = [...document.querySelectorAll(".reason-data")].map((item) => [item.querySelector("h3").textContent, item.querySelector("p").textContent]);
const TOTAL = 365;
const STORAGE_KEYS = { edits: "mypoo365_edits_v2", photos: "mypoo365_photos_v2" };
const $ = (id) => document.getElementById(id);
let activeReasonIndex = 0;
let selectedPhotoSlot = 0;
let toastTimer;

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function messageFor(index) {
  const edits = readJSON(STORAGE_KEYS.edits, {});
  return edits[index] || reasons[index];
}
function dateForIndex(index) {
  const date = new Date(2026, 10, 4 + index);
  return new Intl.DateTimeFormat("ar-EG", { weekday:"long", day:"numeric", month:"long", year:"numeric" }).format(date);
}
function formatDate(date) {
  return new Intl.DateTimeFormat("ar-EG", { weekday:"long", day:"numeric", month:"long", year:"numeric" }).format(date);
}
function renderDaily(index = 0) {
  activeReasonIndex = index;
  const [title, message] = messageFor(index);
  $("todayDate").textContent = dateForIndex(index);
  $("dailyNumber").textContent = `REASON ${String(index+1).padStart(3,"0")} / 365`;
  $("dailyTitle").textContent = title;
  $("dailyMessage").textContent = message;
  $("dailyMessage").hidden = !message;
  $("progressText").textContent = `${index+1} من ${TOTAL}`;
  $("progressFill").style.width = `${((index+1) / TOTAL) * 100}%`;
  $("lockNote").textContent = "كل الرسائل مفتوحة ليكي ♡";
  const previousButton = $("previousReasonButton");
  const nextButton = $("nextReasonButton");
  if (previousButton) previousButton.disabled = index === 0;
  if (nextButton) nextButton.disabled = index === TOTAL - 1;
}
function renderGrid() {
  const grid = $("reasonGrid");
  grid.innerHTML = "";
  for (let i = 0; i < TOTAL; i++) {
    const tile = document.createElement("button");
    tile.className = "reason-tile";
    tile.type = "button";
    tile.innerHTML = `<span class="tile-icon">♡</span><span class="tile-date">${dateForIndex(i)}</span><span class="tile-number">REASON ${String(i+1).padStart(3,"0")}</span><span class="tile-state">اضغطي للقراءة</span>`;
    tile.addEventListener("click", () => {
      renderDaily(i);
      $("today").scrollIntoView({ behavior:"smooth" });
    });
    grid.appendChild(tile);
  }
}
function openEditor() {
  const [title, message] = messageFor(activeReasonIndex);
  $("editTitle").value = title;
  $("editMessage").value = message || "";
  $("editTitle").dataset.index = String(activeReasonIndex);
  $("editDialog").showModal();
}
function saveEditor(event) {
  event.preventDefault();
  const index = Number($("editTitle").dataset.index);
  const edits = readJSON(STORAGE_KEYS.edits, {});
  edits[index] = [$("editTitle").value.trim(), $("editMessage").value.trim()];
  localStorage.setItem(STORAGE_KEYS.edits, JSON.stringify(edits));
  $("editDialog").close();
  renderDaily(index);
  showToast("اتحفظ التعديل بنجاح ♡");
}
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
function renderPhotos() {
  const photos = readJSON(STORAGE_KEYS.photos, {});
  document.querySelectorAll(".memory-slot").forEach((slot, i) => {
    const data = photos[i];
    if (!data) return;
    const img = slot.querySelector("img");
    if (img) img.src = data;
    slot.querySelector("small").textContent = "اضغطي لتغيير الصورة";
  });
}
function handlePhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) return showToast("اختاري ملف صورة من فضلك.");
  if (file.size > 3 * 1024 * 1024) return showToast("الصورة كبيرة. اختاري صورة أقل من 3MB.");
  const reader = new FileReader();
  reader.onload = () => {
    const photos = readJSON(STORAGE_KEYS.photos, {});
    photos[selectedPhotoSlot] = reader.result;
    try {
      localStorage.setItem(STORAGE_KEYS.photos, JSON.stringify(photos));
      renderPhotos();
      showToast("الصورة اتحفظت على جهازك ♡");
    } catch { showToast("مساحة التخزين ممتلئة. جربي صورة أصغر."); }
    event.target.value = "";
  };
  reader.readAsDataURL(file);
}
function setupMenu() {
  const button = $("menuButton"), nav = $("mainNav");
  button.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "×" : "☰";
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open"); button.setAttribute("aria-expanded","false"); button.textContent = "☰";
  }));
}
document.addEventListener("DOMContentLoaded", () => {
  renderDaily(0); renderGrid(); renderPhotos(); setupMenu();
  $("editTodayButton").addEventListener("click", openEditor);
  $("previousReasonButton").addEventListener("click", () => {
    if (activeReasonIndex > 0) renderDaily(activeReasonIndex - 1);
  });
  $("nextReasonButton").addEventListener("click", () => {
    if (activeReasonIndex < TOTAL - 1) renderDaily(activeReasonIndex + 1);
  });
  $("editForm").addEventListener("submit", saveEditor);
  $("photoInput").addEventListener("change", handlePhoto);
  document.querySelectorAll(".memory-slot").forEach(slot => slot.addEventListener("click", () => {
    selectedPhotoSlot = Number(slot.dataset.photo);
    $("photoInput").click();
  }));
});
