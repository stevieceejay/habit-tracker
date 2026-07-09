// Shared frontend behavior for the habit tracker.
// The app now uses a single canonical entry page, but the script remains tolerant of
// older paths such as /frontend/index.html and /templates/habit_form.html.

function initIndexPage() {
  const trackerBody = document.getElementById('tracker-body');
  if (!trackerBody) return;

  const patternContainer = document.getElementById('patterns');
  const habitInput = document.getElementById('habit-input');
  const addForm = document.getElementById('add-form');

  function renderPatterns() {
    const habitRows = trackerBody.querySelectorAll('tr.habit-row');
    const habitCount = habitRows.length;
    const totalSlots = habitCount * 21;
    const activeCount = trackerBody.querySelectorAll('label.box.active').length;
    const completionRate = totalSlots ? Math.round((activeCount / totalSlots) * 100) : 0;

    const changedBoxes = Array.from(trackerBody.querySelectorAll('label.box')).filter((label) => {
      const defaultState = label.dataset.defaultActive === 'true';
      return label.classList.contains('active') !== defaultState;
    }).length;
    const driftRate = totalSlots ? Math.round((changedBoxes / totalSlots) * 100) : 0;
    const points = Math.max(0, 42 - driftRate);

    patternContainer.innerHTML = `
      <h2>PATTERN SCAN</h2>
      <p>${completionRate}% completion</p>
      <p>${driftRate}% drift</p>
      <p>${points}pt</p>
      <p>${habitCount} habit${habitCount === 1 ? '' : 's'} • ${activeCount}/${totalSlots} checks</p>
    `;
  }

  function createDayLabels() {
    return Array.from({ length: 21 }, (_, index) => {
      const label = document.createElement('label');
      label.className = 'box';
      label.dataset.index = index;
      label.dataset.defaultActive = index < 12 ? 'true' : 'false';
      if (index < 12) {
        label.classList.add('active');
      }
      return label;
    });
  }

  function addHabitRow(name = 'Read 20 minutes') {
    const row = document.createElement('tr');
    row.className = 'habit-row';
    row.innerHTML = `<td class="habit-cell">${name}</td><td colspan="7"><div class="day-grid"></div></td>`;
    const dayGrid = row.querySelector('.day-grid');
    createDayLabels().forEach((label) => dayGrid.appendChild(label));
    trackerBody.appendChild(row);
    return row;
  }

  trackerBody.addEventListener('click', (event) => {
    const label = event.target.closest('label.box');
    if (!label) return;

    event.preventDefault();
    label.classList.toggle('active');
    toggleCount += 1;
    renderPatterns();
  });

  if (addForm) {
    addForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = habitInput.value.trim();
      if (!name) return;

      addHabitRow(name);
      habitInput.value = '';
      renderPatterns();
    });
  }

  trackerBody.innerHTML = '';
  addHabitRow();
  renderPatterns();
}

function initHabitFormPage() {
  const form = document.getElementById('habit-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('habit-name').value.trim();
    if (!name) return;

    try {
      const res = await fetch('/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        window.location.href = '/';
      } else {
        alert('Failed to create habit.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').filter(Boolean).pop() || '';
  const isIndexLikePage = ['','index','index.html','frontend/index.html'].includes(currentPage);
  const isHabitFormPage = ['habit-form','habit_form.html','templates/habit_form.html'].includes(currentPage);

  if (isIndexLikePage) {
    initIndexPage();
  } else if (isHabitFormPage) {
    initHabitFormPage();
  }
});
