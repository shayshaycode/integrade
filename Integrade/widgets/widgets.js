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
  });
});

// Launch button using session-based localStorage
launchBtn.addEventListener("click", async () => {
  try {
    const name = nameInput.value.trim();
    const photo = photoInput.files[0];
    const promptInput = document.getElementById("jamboardPrompt");
    const fileInput = document.getElementById("jamboardFile");

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

    const sessionData = {
      room: localStorage.getItem("integradeRoom") || "unnamed",
      name,
      prompt,
      fileName: file?.name || "",
      photo: photoData,
      promptFile: promptFileData,
    };

    sessionStorage.setItem(sessionId, JSON.stringify(sessionData));

    console.log("Launching session:", sessionData);

    window.open(`../widgets/jamboard/jamboard.html?session=${sessionId}`, "_blank");
  } catch (error) {
    console.error("Error launching activity:", error);
    alert("Something went wrong while launching the activity. Check console for details.");
  }
});

// Back button
document.getElementById("back-button").addEventListener("click", () => {
  window.location.href = "../index.html";
});
