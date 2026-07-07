const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let habits = [
  {
    id: cryptoId(),
    name: "Drink 64oz water",
    days: [true, true, false, true, true, false, false],
    prevRate: 43,
  },
  {
    id: cryptoId(),
    name: "Read 20 minutes",
    days: [true, false, false, true, false, false, false],
    prevRate: 71,
  },
  {
    id: cryptoId(),
    name: "No sugar after 8pm",
    days: [false, false, false, false, false, false, false],
    prevRate: null,
  },
];

let undoStack = [];
const UNDO_LIMIT = 10;

function cryptoId() {
  return Math.random().toString(36).slice(2, 9);
}

function updateUndoButton() {
  const btn = document.getElementById("undo-btn");
  btn.disabled = undoStack.length === 0;
  btn.textContent = undoStack.length > 0 ? `Undo remove (${undoStack.length})` : "Undo remove";
}

function currentRate(habit) {
  const checked = habit.days.filter(Boolean).length;
  return Math.round((checked / 7) * 100);
}

function checkSVG() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
}

function render() {
  const tbody = document.getElementById("tracker-body");
  const patterns = document.getElementById("patterns");

  if (habits.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state">No habits yet — add one above to start the grid.</div></td></tr>';
    patterns.innerHTML = "";
    updateUndoButton();
    return;
  }

  tbody.innerHTML = habits.map((h) => rowHTML(h)).join("");

  habits.forEach((h) => {
    DAYS.forEach((_, i) => {
      const input = document.getElementById(`input-${h.id}-${i}`);
      if (!input) return;
      input.addEventListener("click", (event) => {
        event.preventDefault();
        toggleDay(h.id, i);
      });
    });
    document.getElementById(`remove-${h.id}`).addEventListener("click", () => removeHabit(h.id));
  });

  renderPatterns();
  updateUndoButton();
}

function rowHTML(h) {
  const rate = currentRate(h);
  const streakColor = rate >= 60 ? "var(--correct)" : rate >= 30 ? "var(--gold)" : "var(--incorrect)";

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
      </div>`;
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
            <div class="dual-fill prev" style="width:${h.prevRate}%"></div>
          </div>
        </div>
        <div class="dual-row">
          <span class="dual-label">now</span>
          <div class="dual-track">
            <div class="dual-fill ${dir === "down" ? "now-down" : "now-up"}" style="width:${rate}%"></div>
          </div>
        </div>
      </div>`;
  }

  const boxes = h.days
    .map((checked, i) => {
      return `<td><label class="box ${checked ? "checked" : ""}" for="input-${h.id}-${i}"><input id="input-${h.id}-${i}" type="checkbox" ${checked ? "checked" : ""} tabindex="-1" />${checkSVG()}</label></td>`;
    })
    .join("");

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
    </tr>`;
}

function toggleDay(habitId, dayIndex) {
  const h = habits.find((x) => x.id === habitId);
  h.days[dayIndex] = !h.days[dayIndex];
  render();
}

function removeHabit(habitId) {
  const rowEl = document.getElementById(`remove-${habitId}`).closest("tr");
  rowEl.classList.add("row-leaving");
  rowEl.addEventListener(
    "transitionend",
    () => {
      const index = habits.findIndex((h) => h.id === habitId);
      if (index === -1) return;
      const [removed] = habits.splice(index, 1);
      undoStack.push({ habit: removed, index });
      if (undoStack.length > UNDO_LIMIT) undoStack.shift();
      render();
    },
    { once: true }
  );
}

function undoRemove() {
  if (undoStack.length === 0) return;
  const { habit, index } = undoStack.pop();
  const safeIndex = Math.min(index, habits.length);
  habits.splice(safeIndex, 0, habit);
  render();
}

function addHabit(name) {
  habits.push({
    id: cryptoId(),
    name,
    days: [false, false, false, false, false, false, false],
    prevRate: null,
  });
  render();
}

function renderPatterns() {
  const withData = habits.filter((h) => h.prevRate !== null);
  const patterns = document.getElementById("patterns");
  const rates = habits.map((h) => ({ name: h.name, rate: currentRate(h) }));
  const strongest = rates.reduce((a, b) => (b.rate > a.rate ? b : a), rates[0]);
  const weakest = rates.reduce((a, b) => (b.rate < a.rate ? b : a), rates[0]);

  let driftLine = "";
  if (withData.length) {
    const biggestDrop = withData
      .map((h) => ({ name: h.name, diff: currentRate(h) - h.prevRate }))
      .reduce((a, b) => (b.diff < a.diff ? b : a));

    if (biggestDrop.diff < 0) {
      driftLine = `<br><span class="tag">DRIFTING</span><br><strong>${escapeHTML(biggestDrop.name)}</strong> is down ${Math.abs(biggestDrop.diff)}pt versus last week — the one most worth a check-in.`;
    }
  }

  patterns.innerHTML = `<span class="tag">PATTERN SCAN</span><br><strong>${escapeHTML(strongest.name)}</strong> is your strongest pattern this week at ${strongest.rate}%. <strong>${escapeHTML(weakest.name)}</strong> is the weakest at ${weakest.rate}%.${driftLine}<br><span style="font-size:11px; opacity:.8;">This comparison runs in the browser for now — once SQLite is wired up, this will run as a real query across your full history instead of just this week.</span>`;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById("add-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("habit-input");
  const name = input.value.trim();
  if (!name) return;
  addHabit(name);
  input.value = "";
  input.focus();
});

document.getElementById("undo-btn").addEventListener("click", undoRemove);
document.getElementById("new-week-btn").addEventListener("click", () => {
  habits.forEach((h) => {
    h.prevRate = currentRate(h);
    h.days = [false, false, false, false, false, false, false];
  });
  render();
});

render();
