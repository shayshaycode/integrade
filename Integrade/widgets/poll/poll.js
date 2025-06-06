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

  const questions = Array.isArray(session.questions) ? session.questions : [];
  const answers = [];

  if (!questions.length) {
    container.textContent = 'No poll questions found.';
    return;
  }

  questions.forEach((q, idx) => {
    const block = document.createElement('div');
    block.className = 'poll-question-block';

    const title = document.createElement('h2');
    title.className = 'poll-question';
    title.textContent = q.prompt || `Question ${idx + 1}`;
    block.appendChild(title);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0;
    slider.max = Math.max(0, (q.options || []).length - 1);
    slider.value = 0;
    slider.step = 1;
    slider.className = 'poll-slider';
    block.appendChild(slider);

    const labels = document.createElement('div');
    labels.className = 'option-labels';
    (q.options || []).forEach(opt => {
      const span = document.createElement('span');
      span.textContent = opt;
      labels.appendChild(span);
    });
    block.appendChild(labels);

    slider.addEventListener('input', () => {
      answers[idx] = parseInt(slider.value, 10);
      sessionStorage.setItem(`${sessionId}-answers`, JSON.stringify(answers));
    });

    container.appendChild(block);
  });
});
