// app_index.js
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();

  // Only run this logic on index.html
  if (currentPage === "" || currentPage === "index" || currentPage === "index.html") {
    initIndexPage();
  }
});

function initIndexPage() {
  // ================================
  // DOM ELEMENTS
  // ================================
  const trackerBody = document.getElementById("tracker-body");
  const newWeekBtn = document.getElementById("new-week-btn");
  const undoBtn = document.getElementById("undo-btn");

  if (!trackerBody) return; // Defensive: prevents errors if HTML changes

  // ================================
  // STATE
  // ================================
  let habits = [];
  let removedHabits = [];

  // ================================
  // LOAD HABITS FROM BACKEND
  // ================================
  async function loadHabits() {
    const response = await fetch("/habits");
    habits = await response.json();
    renderHabits();
  }

  // ================================
  // RENDER HABITS TABLE
  // ================================
  function renderHabits() {
    trackerBody.innerHTML = "";

    habits.forEach((habit) => {
      const row = document.createElement("tr");
      row.dataset.id = habit.id;

      // Habit name
      const nameCell = document.createElement("td");
      nameCell.textContent = habit.name;
      row.appendChild(nameCell);

      // Days (Mon–Sun)
      habit.days.forEach((checked, index) => {
        const cell = document.createElement("td");
        const box = document.createElement("input");
        box.type = "checkbox";
        box.checked = checked;

        box.addEventListener("change", () => toggleDay(habit.id, index, box.checked));

        cell.appendChild(box);
        row.appendChild(cell);
      });

      // Remove button
      const removeCell = document.createElement("td");
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "✕";
      removeBtn.classList.add("remove-btn");

      removeBtn.addEventListener("click", () => removeHabit(habit.id));

      removeCell.appendChild(removeBtn);
      row.appendChild(removeCell);

      trackerBody.appendChild(row);
    });
  }

  // ================================
  // TOGGLE DAY
  // ================================
  async function toggleDay(id, dayIndex, value) {
    await fetch(`/habits/${id}/toggle`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayIndex, value }),
    });

    loadHabits();
  }

  // ================================
  // REMOVE HABIT
  // ================================
  async function removeHabit(id) {
    const habit = habits.find((h) => h.id === id);
    removedHabits.push(habit);

    await fetch(`/habits/${id}`, { method: "DELETE" });

    loadHabits();
  }

  // ================================
  // UNDO REMOVE
  // ================================
  undoBtn?.addEventListener("click", async () => {
    const habit = removedHabits.pop();
    if (!habit) return;

    await fetch("/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: habit.name }),
    });

    loadHabits();
  });

  // ================================
  // NEW WEEK RESET
  // ================================
  newWeekBtn?.addEventListener("click", async () => {
    await fetch("/reset-week", { method: "POST" });
    loadHabits();
  });

  // ================================
  // INITIAL LOAD
  // ================================
  loadHabits();
}
