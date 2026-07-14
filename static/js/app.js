// ================================
// Constants
// ================================
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


// ================================
// API Helpers
// ================================
async function apiGet(url) {
  const res = await fetch(url);
  return res.json();
}

async function apiPost(url, body = null) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null
  });
  return res.json();
}

async function apiDelete(url) {
  const res = await fetch(url, { method: "DELETE" });
  return res.json();
}

// ================================
// State
// ================================
let habits = [];
let undoStack = [];
const UNDO_LIMIT = 10;

// ================================
// Load habits
// ================================
async function loadHabits() {
  habits = await apiGet("/habits");
  render();
}

// ================================
// Utility
// ================================
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function currentRate(habit) {
  const checked = habit.days.filter(Boolean).length;
  return Math.round((checked / 7) * 100);
}

function checkSVG() {
  return `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;
}

// ================================
// Rendering
// ================================
function render() {
  const tbody = document.getElementById("tracker-body");
  const patterns = document.getElementById("patterns");

  if (habits.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">No habits yet — add one above to start the grid.</div>
        </td>
      </tr>
    `;
    patterns.innerHTML = "";
    updateUndoButton();
    return;
  }

  tbody.innerHTML = habits.map(h => rowHTML(h)).join("");

  habits.forEach(h => {
    DAYS.forEach((_, i) => {
      const input = document.querySelector(`#box-${h.id}-${i} input`);
      input.addEventListener("click", (e) => {
        e.preventDefault();
        toggleDay(h.id, i);
      });
    });

    document.getElementById(`remove-${h.id}`)
      .addEventListener("click", () => removeHabit(h.id));
  });

  renderPatterns();
  updateUndoButton();
}

function rowHTML(h) {
  const rate = currentRate(h);
  const streakColor =
    rate >= 60 ? "var(--correct)" :
    rate >= 30 ? "var(--gold)" :
    "var(--incorrect)";

  let statusHTML;

  if (h.prevRate === null) {
    statusHTML = `
      <div class="status-value new">— New</div>
      <div class="dual-bar">
        <div class="dual-row">
          <span class="dual-label">now</span>
          <div class="dual-track">
            <div class="dual-fill now-up" style="width:${rate}%; background:var(--ink-soft);"></div>
          </div>
        </div>
      </div>
    `;
  } else {
    const diff = rate - h.prevRate;
    const dir = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
    const arrow = dir === "up" ? "▲" : dir === "down" ? "▼" : "—";
    const sign = diff > 0 ? "+" : "";

    statusHTML = `
      <div class="status-value ${dir}">${arrow} ${sign}${diff}pt</div>
      <div class="dual-bar">
        <div class="dual-row">
          <span class="dual-label">prev</span>
          <div class="dual-track">
            <div class="dual-fill prev" style="width:${h.prevRate}%;"></div>
          </div>
        </div>
        <div class="dual-row">
          <span class="dual-label">now</span>
          <div class="dual-track">
            <div class="dual-fill ${dir === "down" ? "now-down" : "now-up"}" style="width:${rate}%;"></div>
          </div>
        </div>
      </div>
    `;
  }

  const boxes = h.days.map((checked, i) => `
    <td>
      <label class="box ${checked ? "checked" : ""}" id="box-${h.id}-${i}">
        <input type="checkbox" ${checked ? "checked" : ""} tabindex="-1">
        ${checkSVG()}
      </label>
    </td>
  `).join("");

  return `
    <tr class="row-enter">
      <td class="habit-cell">
        <div class="habit-name">${escapeHTML(h.name)}</div>
        <div class="streak-track">
          <div class="streak-fill" style="width:${rate}%; background:${streakColor};"></div>
        </div>
      </td>

      ${boxes}

      <td class="status-cell">${statusHTML}</td>

      <td>
        <button type="button" class="icon row-remove" id="remove-${h.id}" aria-label="Remove ${escapeHTML(h.name)}">✕</button>
      </td>
    </tr>
  `;
}

// ================================
// Backend Actions
// ================================
async function toggleDay(habitId, dayIndex) {
  await apiPost(`/habits/toggle/${habitId}/${dayIndex}`);
  await loadHabits();
}

async function removeHabit(habitId) {
  const rowEl = document.getElementById(`remove-${habitId}`).closest("tr");
  rowEl.classList.add("row-leaving");

  rowEl.addEventListener("transitionend", async () => {
    const removed = habits.find(h => h.id === habitId);

    undoStack.push(removed);
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();

    await apiDelete(`/habits/${habitId}`);
    await loadHabits();
  }, { once: true });
}

async function undoRemove() {
  if (undoStack.length === 0) return;

  const habit = undoStack.pop();

  await apiPost("/habits", { name: habit.name });
  await loadHabits();
}

async function addHabit(name) {
  await apiPost("/habits", { name });
  await loadHabits();
}

async function resetWeek() {
  await apiPost("/reset-week");
  await loadHabits();
}

// ================================
// Patterns
// ================================
async function renderPatterns() {
  const data = await apiGet("/patterns");

  if (!data || !data.strongest) {
    document.getElementById("patterns").innerHTML = "";
    return;
  }

  let driftLine = "";
  if (data.drifting) {
    driftLine = `
      <br><span class="tag">DRIFTING</span><br>
      <strong>${escapeHTML(data.drifting.name)}</strong> is down ${Math.abs(data.drifting.diff)}pt versus last week.
    `;
  }

  document.getElementById("patterns").innerHTML = `
    <span class="tag">PATTERN SCAN</span><br>
    <strong>${escapeHTML(data.strongest.name)}</strong> is your strongest pattern this week at ${data.strongest.rate}%.
    <strong>${escapeHTML(data.weakest.name)}</strong> is the weakest at ${data.weakest.rate}%.
    ${driftLine}
    <br><span style="font-size:11px; opacity:.8;">
      This comparison now runs through Flask + SQLite.
    </span>
  `;
}

// ================================
// Buttons
// ================================
function updateUndoButton() {
  const btn = document.getElementById("undo-btn");
  btn.disabled = undoStack.length === 0;
  btn.textContent = undoStack.length > 0
    ? `Undo remove (${undoStack.length})`
    : "Undo remove";
}

document.getElementById("add-form").addEventListener("submit", async e => {
  e.preventDefault();
  const input = document.getElementById("habit-input");
  const name = input.value.trim();
  if (!name) return;

  await addHabit(name);
  input.value = "";
  input.focus();
});

document.getElementById("undo-btn").addEventListener("click", undoRemove);
document.getElementById("new-week-btn").addEventListener("click", resetWeek);

// ================================
// Initial Load
// ================================
loadHabits();
