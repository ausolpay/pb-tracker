// DOM Elements
const loginRegisterPage = document.getElementById("login-register");
const loginPage = document.getElementById("login-page");
const homePage = document.getElementById("home-page");
const workoutEntryPage = document.getElementById("workout-entry");
const dailyTrackingPage = document.getElementById("daily-tracking");
const personalBestsPage = document.getElementById("personal-bests");
const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");
const confirmBtn = document.getElementById("confirm-btn");
const cancelBtn = document.getElementById("cancel-btn");

// Forms and Buttons
const loginRegisterForm = document.getElementById("login-register-form");
const loginForm = document.getElementById("login-form");
const workoutForm = document.getElementById("workout-form");
const dailyTableBody = document.getElementById("daily-table-body");
const pbTableBody = document.getElementById("pb-table-body");
const progressChart = document.getElementById("progress-chart")?.getContext("2d");
const workoutNameInput = document.getElementById("workout-name");
const workoutList = document.getElementById("workout-list");
const logWorkoutBtn = document.getElementById("log-workout-btn");
const dailyTrackingBtn = document.getElementById("daily-tracking-btn");
const personalBestsBtn = document.getElementById("personal-bests-btn");
const backButtons = document.querySelectorAll(".back-btn");
const resetPBBtn = document.getElementById("reset-pb-btn");
const logoutBtns = document.querySelectorAll(".logout-btn");
const loginLink = document.getElementById("login-link");
const registerLink = document.getElementById("register-link");

// Data Keys
const USERS_KEY = "registeredUsers";
const CURRENT_USER_KEY = "currentUser";
const WORKOUTS_KEY = "workoutData";
const PB_KEY = "personalBests";
const HIDDEN_PB_KEY = "hiddenPersonalBests";

// Data Storage
let registeredUsers = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
let currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;
let workouts = JSON.parse(localStorage.getItem(WORKOUTS_KEY)) || [];
let personalBests = JSON.parse(localStorage.getItem(PB_KEY)) || {};
let hiddenPersonalBests = JSON.parse(localStorage.getItem(HIDDEN_PB_KEY)) || {};

// Chart Instance
let chart;

// Utility Functions
function showPage(page) {
  [loginRegisterPage, loginPage, homePage, workoutEntryPage, dailyTrackingPage, personalBestsPage].forEach((p) =>
    p?.classList.add("hidden")
  );
  page?.classList.remove("hidden");
}

function updateWelcomeMessage() {
  const welcomeMessage = document.getElementById("welcome-message");
  if (currentUser) {
    welcomeMessage.textContent = `Welcome, ${currentUser.firstName}!`;
  }
}

function addWorkoutToDropdown(workoutName) {
  if (![...workoutList.options].some((option) => option.value === workoutName)) {
    const option = document.createElement("option");
    option.value = workoutName;
    workoutList.appendChild(option);
  }
}

function displayWorkouts() {
  dailyTableBody.innerHTML = "";
  workouts.forEach((workout, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${workout.workoutName}</td>
      <td>${workout.reps}</td>
      <td>${workout.weight}</td>
      <td>${workout.date}</td>
      <td>
        <button onclick="editWorkout(${index})" class="edit-btn">Edit</button>
        <button onclick="deleteWorkout(${index})" class="delete-btn">Delete</button>
      </td>
    `;
    dailyTableBody.appendChild(row);
  });
}

function displayPersonalBests() {
  pbTableBody.innerHTML = "";
  Object.keys(personalBests).forEach((workoutName) => {
    const pb = personalBests[workoutName];
    const row = document.createElement("tr");
    row.innerHTML = `
      <td onclick="showWorkoutProgress('${workoutName}')">${workoutName}</td>
      <td>${pb.reps}</td>
      <td>${pb.weight}</td>
      <td>${pb.date}</td>
    `;
    pbTableBody.appendChild(row);
  });
}

function showWorkoutProgress(workoutName) {
  const data = hiddenPersonalBests[workoutName] || [];
  const labels = data.map((entry) => entry.date);
  const weights = data.map((entry) => entry.weight);

  // If no data available, display a message
  if (data.length === 0) {
    alert(`No progress data available for ${workoutName}.`);
    return;
  }

  // Destroy the existing chart if it exists
  if (chart) chart.destroy();

  // Create a new bar chart
  chart = new Chart(progressChart, {
    type: "bar",
    data: {
      labels, // X-axis labels (dates)
      datasets: [
        {
          label: `${workoutName} Progress`,
          data: weights, // Y-axis data (weights in kg)
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Weight (kg)",
          },
        },
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
      },
    },
  });

  // Highlight the selected row
  Array.from(pbTableBody.children).forEach((row) => row.classList.remove("highlight"));
  const selectedRow = Array.from(pbTableBody.children).find(
    (row) => row.children[0].textContent === workoutName
  );
  if (selectedRow) selectedRow.classList.add("highlight");
}

// Login Functionality
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const user = registeredUsers.find((user) => user.email === email && user.password === password);
  if (user) {
    currentUser = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    updateWelcomeMessage();
    displayWorkouts();
    displayPersonalBests();
    showPage(homePage);
  } else {
    alert("Invalid email or password. Please try again.");
  }
});

// Register Functionality
loginRegisterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const firstName = document.getElementById("register-first-name").value.trim();
  const lastName = document.getElementById("register-last-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;

  if (!firstName || !lastName || !email || !password) {
    alert("Please fill out all fields correctly.");
    return;
  }

  if (registeredUsers.some((user) => user.email === email)) {
    alert("Email is already registered. Please use a different email.");
    return;
  }

  const newUser = { firstName, lastName, email, password };
  registeredUsers.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(registeredUsers));
  alert("Registration successful! You can now log in.");
  loginRegisterForm.reset();
  showPage(loginPage);
});

// Link Handlers
loginLink.addEventListener("click", (e) => {
  e.preventDefault();
  showPage(loginPage);
});

registerLink.addEventListener("click", (e) => {
  e.preventDefault();
  showPage(loginRegisterPage);
});

// Add Workout
workoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const workoutName = workoutNameInput.value.trim();
  const reps = parseInt(document.getElementById("reps").value);
  const weight = parseInt(document.getElementById("weight").value);
  const date = new Date().toLocaleDateString();

  if (!workoutName || isNaN(reps) || isNaN(weight)) {
    alert("Please fill out all fields correctly.");
    return;
  }

  workouts.push({ workoutName, reps, weight, date });

  if (!personalBests[workoutName] || personalBests[workoutName].weight < weight) {
    if (!hiddenPersonalBests[workoutName]) hiddenPersonalBests[workoutName] = [];
    if (personalBests[workoutName]) hiddenPersonalBests[workoutName].push(personalBests[workoutName]);
    personalBests[workoutName] = { reps, weight, date };
  }

  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  localStorage.setItem(PB_KEY, JSON.stringify(personalBests));
  localStorage.setItem(HIDDEN_PB_KEY, JSON.stringify(hiddenPersonalBests));

  addWorkoutToDropdown(workoutName);
  displayWorkouts();
  displayPersonalBests();
  workoutForm.reset();

  // Navigate to Daily Tracking
  showPage(dailyTrackingPage);
});

// Edit Workout
function editWorkout(index) {
  const row = dailyTableBody.children[index];
  const workout = workouts[index];

  row.innerHTML = `
    <td><input type="text" value="${workout.workoutName}" id="edit-name-${index}" style="min-width: 80px;" /></td>
    <td><input type="number" value="${workout.reps}" id="edit-reps-${index}" style="min-width: 50px;" /></td>
    <td><input type="number" value="${workout.weight}" id="edit-weight-${index}" style="min-width: 50px;" /></td>
    <td>${workout.date}</td>
    <td>
      <button onclick="submitEdit(${index})" class="edit-btn">Submit</button>
    </td>
  `;
}

function submitEdit(index) {
  const nameInput = document.getElementById(`edit-name-${index}`);
  const repsInput = document.getElementById(`edit-reps-${index}`);
  const weightInput = document.getElementById(`edit-weight-${index}`);

  workouts[index] = {
    workoutName: nameInput.value,
    reps: parseInt(repsInput.value),
    weight: parseInt(weightInput.value),
    date: workouts[index].date,
  };

  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  displayWorkouts();
}

// Delete Workout
function deleteWorkout(index) {
  modalText.textContent = "Are you sure you want to delete this workout?";
  modal.classList.remove("hidden");

  confirmBtn.onclick = () => {
    workouts.splice(index, 1);
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
    displayWorkouts();
    modal.classList.add("hidden"); // Hide modal after confirming
  };

  cancelBtn.onclick = () => {
    modal.classList.add("hidden"); // Hide modal if canceled
  };
}

// Reset Personal Bests
resetPBBtn.addEventListener("click", () => {
  modalText.textContent = "Are you sure you want to reset all personal bests?";
  modal.classList.remove("hidden");

  confirmBtn.onclick = () => {
    personalBests = {};
    hiddenPersonalBests = {};
    workouts.forEach((workout) => {
      if (
        !personalBests[workout.workoutName] ||
        personalBests[workout.workoutName].weight < workout.weight
      ) {
        personalBests[workout.workoutName] = {
          reps: workout.reps,
          weight: workout.weight,
          date: workout.date,
        };
      }
    });

    localStorage.setItem(PB_KEY, JSON.stringify(personalBests));
    localStorage.setItem(HIDDEN_PB_KEY, JSON.stringify(hiddenPersonalBests));
    displayPersonalBests();
    modal.classList.add("hidden"); // Hide modal after resetting
  };

  cancelBtn.onclick = () => {
    modal.classList.add("hidden"); // Hide modal if canceled
  };
});


// Logout Functionality
logoutBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentUser = null;
    localStorage.removeItem(CURRENT_USER_KEY);
    showPage(loginRegisterPage);
  });
});

// Navigation
logWorkoutBtn.addEventListener("click", () => showPage(workoutEntryPage));
dailyTrackingBtn.addEventListener("click", () => showPage(dailyTrackingPage));
personalBestsBtn.addEventListener("click", () => showPage(personalBestsPage));
backButtons.forEach((btn) => btn.addEventListener("click", () => showPage(homePage)));

// Initialize
window.onload = () => {
  if (currentUser) {
    updateWelcomeMessage();
    displayWorkouts();
    displayPersonalBests();
    workouts.forEach((workout) => addWorkoutToDropdown(workout.workoutName));
    showPage(homePage);
  } else {
    showPage(loginRegisterPage);
  }
};
