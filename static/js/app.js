// app.js — unified script for index.html and habit_form.html

// ✅ Tracker page logic (index.html)
function initIndexPage() {
  document.querySelectorAll('.habit-checkbox').forEach(box => {
    box.addEventListener('change', async (e) => {
      const habitId = e.target.dataset.habitId;
      const dayIndex = e.target.dataset.dayIndex;

      try {
        const res = await fetch(`/habits/check/${habitId}/${dayIndex}`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to save');
      } catch (err) {
        // Revert the checkbox visually if the save failed, so the UI never lies about saved state
        e.target.checked = !e.target.checked;
        console.error(err);
      }
    });
  });
}

// ✅ Form page logic (habit_form.html)
function initHabitFormPage() {
  const form = document.getElementById('habit-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('habit-name').value.trim();
    if (!name) return;

    try {
      const res = await fetch('/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        window.location.href = 'index.html';
      } else {
        alert('Failed to create habit.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  });
}

// ✅ Page detection and initialization
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop();

  if (currentPage === 'index.html') {
    initIndexPage();
  } else if (currentPage === 'habit_form.html') {
    initHabitFormPage();
  }
});
