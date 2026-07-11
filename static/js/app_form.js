// app_form.js

document.addEventListener("DOMContentLoaded", () => {
  initHabitFormPage();
});

function initHabitFormPage() {
  const form = document.getElementById("habit-form");
  if (!form) return;

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

