// app_form.js

document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();

  // Only run on habit_form.html
  if (
    currentPage === "habit_form" ||
    currentPage === "habit_form.html"
  ) {
    initHabitFormPage();
  }
});

function initHabitFormPage() {
  const form = document.getElementById("habit-form");
  if (!form) return; // Defensive: prevents errors if template changes

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("habit-name");
    const name = nameInput.value.trim();

    if (!name) return;

    try {
      const response = await fetch("/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        // Redirect back to dashboard
        window.location.href = "/";
      } else {
        alert("Failed to save habit. Try again.");
      }
    } catch (err) {
      console.error("Error saving habit:", err);
      alert("Network error. Try again.");
    }
  });
}
