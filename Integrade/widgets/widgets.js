// Get activity room name
let room;

document.addEventListener("DOMContentLoaded", () => {
  room = localStorage.getItem("integradeRoom");

  if (!room) {
    alert("Activity name not found. Please start from the home page.");
    window.location.href = "../index.html";
    return;
  }

  document.getElementById("room-label").textContent = `Activity: ${room}`;
});


document.getElementById("room-label").textContent = `Activity: ${room}`;

// DOM references
const nameInput = document.getElementById("displayName");
const photoInput = document.getElementById("userPhoto");
const submitButton = document.getElementById("submitUserInfo");
const previewContainer = document.getElementById("userPreview");
const previewImg = document.getElementById("previewPhoto");
const previewName = document.getElementById("previewName");
const setupContent = document.getElementById("setupContent");
const previewArea = document.getElementById("previewArea");
const widgetCards = document.querySelectorAll(".widget-card");
const launchBtn = document.getElementById("launchJamboard");

let selectedTemplate = null;

// Convert file to base64
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Handle "Submit Info"
submitButton.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const file = photoInput.files[0];

  if (!name || !file) {
    alert("Please enter your name and upload a photo.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    previewImg.src = e.target.result;
    previewName.textContent = name;
    previewContainer.classList.remove("hidden");
  };

  reader.readAsDataURL(file);
});

// Handle widget card selection
widgetCards.forEach(card => {
  card.addEventListener("click", () => {
    widgetCards.forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");

    selectedTemplate = card.getAttribute("data-template");

    if (selectedTemplate === "jamboard") {
      setupContent.innerHTML = `
        <div class="jamboard-setup">
          <p><strong>Jamboard Setup:</strong> Add a prompt that will appear at the top of the board. You can also attach a supporting image or PDF.</p>

          <div class="form-row">
            <label for="jamboardPrompt">Prompt:</label>
            <input type="text" id="jamboardPrompt" placeholder="e.g. What's one idea to improve our project?" />
          </div>

          <div class="form-row">
            <label for="jamboardFile">Attach File:</label>
            <input type="file" id="jamboardFile" accept=".png,.jpg,.jpeg,.pdf" />
          </div>
        </div>
      `;

      const promptInput = document.getElementById("jamboardPrompt");
      const fileInput = document.getElementById("jamboardFile");

      promptInput.addEventListener("input", updatePreview);
      fileInput.addEventListener("change", updatePreview);

      function updatePreview() {
        const prompt = promptInput.value.trim();
        const file = fileInput.files[0];
        let html = "";

        if (prompt) {
          html += `<p><strong>Prompt Preview:</strong> ${prompt}</p>`;
        }

        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            const ext = file.name.split('.').pop().toLowerCase();
            if (["png", "jpg", "jpeg"].includes(ext)) {
              html += `<img src="${e.target.result}" style="max-width: 100%; border-radius: 8px; margin-top: 1rem;" />`;
            } else if (ext === "pdf") {
              html += `<embed src="${e.target.result}" type="application/pdf" width="100%" height="300px" style="margin-top: 1rem;" />`;
            }
            previewArea.innerHTML = html;
          };
          reader.readAsDataURL(file);
        } else {
          previewArea.innerHTML = html;
        }
      }
    }
    else if (selectedTemplate === "poll") {
      setupContent.innerHTML = `
        <div class="poll-setup">
          <p><strong>Poll Setup:</strong> Write each prompt with 2-5 options. Use the + button to add more questions.</p>
          <div id="pollQuestions"></div>
          <button id="addQuestionButton" type="button" class="add-question-btn">+ Add Question</button>
        </div>
      `;

      const pollQuestions = document.getElementById("pollQuestions");
      const addQuestionButton = document.getElementById("addQuestionButton");

      function addQuestion() {
        const index = pollQuestions.children.length + 1;
        const wrapper = document.createElement("div");
        wrapper.className = "poll-question-form";
        wrapper.innerHTML = `
          <div class="form-row">
            <label>Prompt ${index}:</label>
            <input type="text" class="poll-question-input" placeholder="Enter question ${index}" />
          </div>
          <div class="poll-option-wrapper">
            <div class="form-row">
              <label>Option 1:</label>
              <input type="text" class="poll-option" placeholder="Option 1" />
            </div>
            <div class="form-row">
              <label>Option 2:</label>
              <input type="text" class="poll-option" placeholder="Option 2" />
            </div>
            <div class="extra-options"></div>
            <button type="button" class="add-option-btn">Add Option</button>
          </div>
        `;
        pollQuestions.appendChild(wrapper);

        const addOptBtn = wrapper.querySelector(".add-option-btn");
        const extraOpt = wrapper.querySelector(".extra-options");
        let optCount = 2;

        addOptBtn.addEventListener("click", () => {
          if (optCount >= 5) return;
          optCount++;
          const row = document.createElement("div");
          row.className = "form-row";
          row.innerHTML = `<label>Option ${optCount}:</label><input type="text" class="poll-option" placeholder="Option ${optCount}" />`;
          extraOpt.appendChild(row);
          row.querySelector(".poll-option").addEventListener("input", updatePreview);
        });

        wrapper.querySelectorAll("input").forEach(i => i.addEventListener("input", updatePreview));
        updatePreview();
      }

      function updatePreview() {
        const questions = Array.from(document.querySelectorAll('.poll-question-form')).map((q, idx) => {
          const prompt = q.querySelector('.poll-question-input').value.trim();
          const opts = Array.from(q.querySelectorAll('.poll-option')).map(o => o.value.trim()).filter(Boolean);
          return { prompt, opts };
        }).filter(q => q.prompt && q.opts.length >= 2);

        if (!questions.length) {
          previewArea.innerHTML = '<p>No setup data yet.</p>';
          return;
        }

        let html = '';
        questions.forEach((q, i) => {
          html += `<p><strong>${i + 1}. ${q.prompt}</strong></p>`;
          html += '<ul>' + q.opts.map(o => `<li>${o}</li>`).join('') + '</ul>';
        });
        previewArea.innerHTML = html;
      }

      addQuestionButton.addEventListener('click', () => {
        addQuestion();
      });

      addQuestion();
    }
  });
});

// Launch button using session-based localStorage
launchBtn.addEventListener("click", async () => {
  try {
    const name = nameInput.value.trim();
    const photo = photoInput.files[0];
    const promptInput = document.getElementById("jamboardPrompt");
    const fileInput = document.getElementById("jamboardFile");
    const pollForms = document.querySelectorAll('.poll-question-form');

    if (!selectedTemplate) {
      alert("Please select a widget.");
      return;
    }

    if (!name || !photo) {
      alert("Please submit your info in Step 1.");
      return;
    }

    const prompt = promptInput?.value.trim() || "";
    const file = fileInput?.files[0];

    const photoData = await fileToBase64(photo);
    const promptFileData = file ? await fileToBase64(file) : null;
    const sessionId = `session-${Date.now()}`;

    let sessionData = {
      room: localStorage.getItem("integradeRoom") || "unnamed",
      name,
      photo: photoData,
    };

    if (selectedTemplate === "jamboard") {
      sessionData = {
        ...sessionData,
        prompt,
        fileName: file?.name || "",
        promptFile: promptFileData,
      };
    } else if (selectedTemplate === "poll") {
      const questions = Array.from(pollForms).map(form => {
        const promptTxt = form.querySelector('.poll-question-input').value.trim();
        const opts = Array.from(form.querySelectorAll('.poll-option'))
          .map(o => o.value.trim())
          .filter(Boolean);
        return { prompt: promptTxt, options: opts };
      }).filter(q => q.prompt && q.options.length >= 2);

      if (!questions.length) {
        alert("Please provide at least one prompt with two options.");
        return;
      }

      sessionData = { ...sessionData, questions };
    }

    sessionStorage.setItem(sessionId, JSON.stringify(sessionData));

    console.log("Launching session:", sessionData);

    if (selectedTemplate === "jamboard") {
      window.open(`../widgets/jamboard/jamboard.html?session=${sessionId}`, "_blank");
    } else if (selectedTemplate === "poll") {
      window.open(`../widgets/poll/poll.html?session=${sessionId}`, "_blank");
    }
  } catch (error) {
    console.error("Error launching activity:", error);
    alert("Something went wrong while launching the activity. Check console for details.");
  }
});

// Back button
document.getElementById("back-button").addEventListener("click", () => {
  window.location.href = "../index.html";
});
