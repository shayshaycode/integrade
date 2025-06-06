document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session');
  let session = null;
  if (sessionId) {
    const raw = sessionStorage.getItem(sessionId);
    if (raw) {
      session = JSON.parse(raw);
    }
  }

  const roomLabel = document.getElementById('room-label-display');
  const container = document.getElementById('poll-container');

  if (!session) {
    container.textContent = 'No poll data found.';
    return;
  }

  roomLabel.textContent = `Room: ${session.room || 'unknown'}`;

  const question = session.question || '';
  const options = Array.isArray(session.options) ? session.options : [];
  const followup = session.followup || '';

  let html = '';
  if (question) {
    html += `<h2 class="poll-question">${question}</h2>`;
  }
  if (options.length) {
    html += '<ul class="poll-options">';
    options.forEach(opt => {
      html += `<li>${opt}</li>`;
    });
    html += '</ul>';
  }
  if (followup) {
    html += `<p class="poll-followup">${followup}</p>`;
  }
  container.innerHTML = html;
});
