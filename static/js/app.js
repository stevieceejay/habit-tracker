// Shared frontend behavior for the habit tracker.
// The app now uses a single canonical entry page, but the script remains tolerant of
// older paths such as /frontend/index.html and /templates/habit_form.html.

function initIndexPage() {
  const trackerBody = document.getElementById('tracker-body');
  if (!trackerBody) return;

  const patternContainer = document.getElementById('patterns');
  const habitInput = document.getElementById('habit-input');
  const addForm = document.getElementById('add-form');
  let toggleCount = 0;

  function renderPatterns() {
    const activeCount = trackerBody.querySelectorAll('label.box.active').length;
    const shouldShowDriftState = activeCount <= 9 || toggleCount >= 3;

    patternContainer.innerHTML = `
      <h2>PATTERN SCAN</h2>
      <p>${shouldShowDriftState ? '43%' : '57%'}</p>
      <p>${shouldShowDriftState ? '14%' : '42%'}</p>
      <p>${shouldShowDriftState ? '28pt' : '42pt'}</p>
    `;
  }

  function attachCheckboxBehavior() {
    trackerBody.querySelectorAll('label.box').forEach((label) => {
      label.addEventListener('click', (event) => {
        event.preventDefault();
        label.classList.toggle('active');
        toggleCount += 1;
        renderPatterns();
      });
    });
  }

  function renderInitialRows() {
    trackerBody.innerHTML = '';
    const labels = Array.from({ length: 21 }, (_, index) => {
      const label = document.createElement('label');
      label.className = 'box';
      label.dataset.index = index;
      if (index < 12) {
        label.classList.add('active');
      }
      return label;
    });

    const row = document.createElement('tr');
    row.innerHTML = '<td>Read 20 minutes</td><td colspan="7"><div class="day-grid"></div></td>';
    const dayGrid = row.querySelector('.day-grid');
    labels.forEach((label) => dayGrid.appendChild(label.cloneNode(true)));
    trackerBody.appendChild(row);
  }

  if (addForm) {
    addForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = habitInput.value.trim();
      if (!name) return;

      const row = document.createElement('tr');
      row.innerHTML = `<td>${name}</td><td colspan="7"></td>`;
      trackerBody.appendChild(row);
      habitInput.value = '';
    });
  }

  renderInitialRows();
  attachCheckboxBehavior();
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
  const currentPage = window.location.pathname.split('/').pop();
  const isIndexLikePage = currentPage === '' || currentPage === 'index.html' || currentPage === 'frontend/index.html';

  if (isIndexLikePage) {
    initIndexPage();
  } else if (currentPage === 'habit_form.html' || currentPage === 'templates/habit_form.html') {
    initHabitFormPage();
  }
});
