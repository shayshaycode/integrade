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
  const submitBtn = document.getElementById('submitPoll');

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

  submitBtn.addEventListener('click', async () => {
    try {
      const resp = await fetch('../../includes/poll_results.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: session.room || 'unknown', answers })
      });
      const data = await resp.json();
      if (!data.success) throw new Error(data.error || 'submit failed');

      const resResp = await fetch(`../../includes/poll_results.php?room=${encodeURIComponent(session.room || 'unknown')}`);
      const resData = await resResp.json();
      if (resData.success) {
        showResults(resData.results);
      } else {
        alert('Failed to load results');
      }
    } catch (e) {
      console.error(e);
      alert('Error submitting poll');
    }
  });

  function showResults(results) {
    container.innerHTML = '';
    questions.forEach((q, idx) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'result-chart';
      container.appendChild(canvas);
      const counts = [];
      const labels = [];
      (q.options || []).forEach((opt, i) => {
        labels.push(opt);
        counts.push(results[idx]?.[i] || 0);
      });
      new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ data: counts, backgroundColor: '#8604e7' }]
        },
        options: {
          plugins: {
            legend: { display: false },
            title: { display: true, text: q.prompt }
          },
          responsive: true,
          scales: { y: { beginAtZero: true, precision: 0 } }
        }
      });
    });
    submitBtn.remove();
  }
});
