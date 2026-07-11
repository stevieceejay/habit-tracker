document.addEventListener("DOMContentLoaded", () => {
  loadHabits();

  const resetBtn = document.getElementById("new-week-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetWeek);
  }
});


async function loadHabits() {
  const response = await fetch("/habits");
  const habits = await response.json();
  renderHabits(habits);
}


function renderHabits(habits) {
  const container = document.getElementById("tracker-body");
  container.innerHTML = "";

  habits.forEach((habit) => {
    const habitRow = document.createElement("div");
    habitRow.className = "habit-row";

    // Habit name
    const nameEl = document.createElement("span");
    nameEl.className = "habit-name";
    nameEl.textContent = habit.name;
    habitRow.appendChild(nameEl);

    // 🔥 Streak display
    const streakEl = document.createElement("span");
    streakEl.className = "habit-streak";
    streakEl.textContent = `🔥 Streak: ${habit.streak}`;
    habitRow.appendChild(streakEl);

    // Expired styling
    if (habit.expired) {
      habitRow.classList.add("expired");
    }

    // Days checkboxes
    const daysContainer = document.createElement("div");
    daysContainer.className = "days-container";

    habit.days.forEach((completed, dayIndex) => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = completed;

      checkbox.addEventListener("change", () => {
        toggleHabit(habit.id, dayIndex);
      });

      daysContainer.appendChild(checkbox);
    });

    habitRow.appendChild(daysContainer);

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", () => {
      deleteHabit(habit.id);
    });

    habitRow.appendChild(deleteBtn);

    container.appendChild(habitRow);
  });
}


// ================================
// Toggle Habit Day
// ================================
async function toggleHabit(habitId, dayIndex) {
  await fetch(`/habits/${habitId}/toggle`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dayIndex }),
  });

  loadHabits();
}


// ================================
// Delete Habit
// ================================
async function deleteHabit(habitId) {
  await fetch(`/habits/${habitId}`, {
    method: "DELETE",
  });

  loadHabits();
}


// ================================
// Reset Week
// ================================
async function resetWeek() {
  await fetch("/reset-week", {
    method: "POST",
  });

  loadHabits();
}
