// Handle new activity creation
const roomForm = document.getElementById("room-form");
if (roomForm) {
  roomForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const roomName = document.getElementById("roomName").value.trim();

    if (!roomName) {
      alert("Please enter an activity name.");
      return;
    }

    const formData = new FormData();
    formData.append("name", roomName);

    try {
      const res = await fetch("includes/activities.php", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        alert("Failed to save activity");
        return;
      }
    } catch (err) {
      console.error("Activity creation failed", err);
    }

    localStorage.setItem("integradeRoom", roomName);
    window.location.href = "widgets/widgets.html";
  });
}

// Handle returning to existing activity
const returnForm = document.getElementById("return-form");
const activitySelect = document.getElementById("activitySelect");
const activityLoading = document.getElementById("activities-loading");
const activityContainer = document.getElementById("activity-select-container");
const noActivitiesMessage = document.getElementById("noActivitiesMessage");

async function loadActivities() {
  if (!activityLoading) return;
  try {
    const res = await fetch("includes/activities.php");
    const data = await res.json();
    activityLoading.style.display = "none";
    if (data.success && data.activities && data.activities.length > 0) {
      data.activities.forEach((act) => {
        const opt = document.createElement("option");
        opt.value = act.name;
        opt.textContent = act.name;
        activitySelect.appendChild(opt);
      });
      activityContainer.style.display = "block";
    } else {
      noActivitiesMessage.style.display = "block";
    }
  } catch (err) {
    activityLoading.textContent = "Failed to load activities";
    console.error("Load activities error", err);
  }
}

if (returnForm) {
  returnForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const roomName = activitySelect.value;

    if (!roomName) {
      alert("Please select an activity.");
      return;
    }

    localStorage.setItem("integradeRoom", roomName);
    window.location.href = "widgets/widgets.html";
  });
  loadActivities();
}
