// Handle new activity creation
const roomForm = document.getElementById("room-form");
if (roomForm) {
  roomForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const roomName = document.getElementById("roomName").value.trim();

    if (!roomName) {
      alert("Please enter an activity name.");
      return;
    }

    localStorage.setItem("integradeRoom", roomName);
    window.location.href = "widgets/widgets.html";
  });
}

// Handle returning to existing activity
const returnForm = document.getElementById("return-form");
if (returnForm) {
  returnForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const roomName = document.getElementById("returnRoomName").value.trim();

    if (!roomName) {
      alert("Please enter the name of your previous activity.");
      return;
    }

    localStorage.setItem("integradeRoom", roomName);
    window.location.href = "widgets/widgets.html";
  });
}
