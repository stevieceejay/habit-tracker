document.addEventListener('DOMContentLoaded', () => {
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
});