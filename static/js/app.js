const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

async function apiGet(url) {
  const res = await fetch(url);
  return res.json();
}

async function apiPost(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });
  return res.json();
}

async function apiDelete(url) {
  const res = await fetch(url, { method:"DELETE" });
  return res.json();
}

/* -------------------------------
   Status Bar (Dashboard)
------------------------------- */
function renderStatusBar(habits) {
  const bar = document.getElementById("status-bar");
  if (!bar) return;

  const totalChecks = habits.reduce((sum,h)=>sum+h.days.filter(Boolean).length,0);
  const totalPossible = habits.length * 7;
  const percent = totalPossible === 0 ? 0 : Math.round((totalChecks/totalPossible)*100);

  bar.innerHTML = `
    <div class="status-wrapper">
      <p><strong>${percent}%</strong> weekly completion</p>
      <div class="status-track">
        <div class="status-fill" style="width:${percent}%"></div>
      </div>
    </div>
  `;
}

/* -------------------------------
   Analysis Page
------------------------------- */
function renderAnalysis(habits) {
  const container = document.getElementById("analysis-summary");
  if (!container) return;

  const totalHabits = habits.length;
  const totalChecks = habits.reduce((sum,h)=>sum+h.days.filter(Boolean).length,0);
  const avg = totalHabits === 0 ? 0 : Math.round(totalChecks / totalHabits);

  const best = habits.reduce((a,b)=>a.days.filter(Boolean).length > b.days.filter(Boolean).length ? a : b, habits[0] || null);
  const worst = habits.reduce((a,b)=>a.days.filter(Boolean).length < b.days.filter(Boolean).length ? a : b, habits[0] || null);

  container.innerHTML = `
    <h3>Overall Summary</h3>
    <p>Total habits: ${totalHabits}</p>
    <p>Total checkmarks: ${totalChecks}</p>
    <p>Average per habit: ${avg}/7</p>
    <p>Best habit: ${best ? best.name : "None"}</p>
    <p>Worst habit: ${worst ? worst.name : "None"}</p>
  `;

  const progress = document.getElementById("analysis-progress");
  if (progress) {
    const percent = totalHabits === 0 ? 0 : Math.round((totalChecks/(totalHabits*7))*100);
    progress.innerHTML = `
      <h3>Overall Completion</h3>
      <div class="status-track">
        <div class="status-fill" style="width:${percent}%"></div>
      </div>
      <p>${percent}%</p>
    `;
  }
}

/* -------------------------------
   Habit Table Renderer
------------------------------- */
function rowHTML(habit) {
  const dayCells = habit.days.map((checked,i)=>`
    <td>
      <div class="day-box" id="box-${habit.id}-${i}">
        <input type="checkbox" ${checked?"checked":""} />
      </div>
    </td>
  `).join("");

  return `
    <tr id="row-${habit.id}">
      <td>${habit.name}</td>
      ${dayCells}
      <td>${habit.days.filter(Boolean).length}/7</td>
      <td><span class="trash" data-id="${habit.id}">🗑️</span></td>
    </tr>
  `;
}

function render(habits) {
  const tbody = document.getElementById("tracker-body");
  if (tbody) tbody.innerHTML = habits.map(rowHTML).join("");

  renderStatusBar(habits);

  setTimeout(()=>{
    habits.forEach(habit=>{
      habit.days.forEach((checked,i)=>{
        const box = document.querySelector(`#box-${habit.id}-${i} input`);
        if (!box) return;
        box.addEventListener("change", async ()=>{
          await apiPost(`/habits/toggle/${habit.id}/${i}`, {});
          loadHabits();
        });
      });
    });

    document.querySelectorAll(".trash").forEach(icon=>{
      icon.addEventListener("click", async ()=>{
        await apiDelete(`/habits/${icon.dataset.id}`);
        loadHabits();
      });
    });
  },0);
}

async function loadHabits() {
  const habits = await apiGet("/habits");
  render(habits);
  renderAnalysis(habits);
}

async function addHabit(name) {
  await apiPost("/habits",{name});
  loadHabits();
}

document.addEventListener("DOMContentLoaded",()=>{
  loadHabits();

  const form = document.getElementById("add-form");
  if (form) {
    form.addEventListener("submit",async e=>{
      e.preventDefault();
      const input = document.getElementById("habit-input");
      if (!input) return;
      const name = input.value.trim();
      if (!name) return;
      await addHabit(name);
      input.value="";
    });
  }
});
