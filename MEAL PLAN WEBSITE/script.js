// --------------------------
// 0. Login Check: redirect if not logged in
// --------------------------
const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
if (!loggedInUser) {
  // Redirect immediately to login page
  window.location.href = "login.html";
}

// --------------------------
// 1. Log Out Button
// --------------------------
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    // Remove logged-in user
    localStorage.removeItem('loggedInUser');
    // Redirect to login page
    window.location.href = "login.html";
  });
}

// --------------------------
// 2. Load/Save User Data
// --------------------------
function loadUserData() {
  const data = localStorage.getItem(`user_${loggedInUser.username}`);
  return data ? JSON.parse(data) : { notes: "", calendar: {} };
}

function saveUserData(userData) {
  localStorage.setItem(`user_${loggedInUser.username}`, JSON.stringify(userData));
}

let userData = loadUserData();

// --------------------------
// 3. Notes
// --------------------------
const notesBox = document.getElementById('notesBox');
const saveNotesBtn = document.getElementById('saveNotes');

if (notesBox) notesBox.value = userData.notes || "";

if (saveNotesBtn) {
  saveNotesBtn.addEventListener('click', () => {
    userData.notes = notesBox.value;
    saveUserData(userData);
    alert("Notes saved!");
  });
}

// --------------------------
// 4. Calendar Setup
// --------------------------
const calendarEl = document.getElementById('calendar');
const monthSelect = document.getElementById('month');
const entryForm = document.getElementById('entryForm');
const selectedDateEl = document.getElementById('selectedDate');
const mealInput = document.getElementById('mealInput');
const workoutInput = document.getElementById('workoutInput');
const saveEntryBtn = document.getElementById('saveEntry');
const closeFormBtn = document.getElementById('closeForm');
const upcomingEventsEl = document.getElementById('upcomingEvents');

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Populate month dropdown
const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

if (monthSelect) {
  monthNames.forEach((name,i)=>{
    const option = document.createElement('option');
    option.value = i;
    option.textContent = name;
    if(i===currentMonth) option.selected = true;
    monthSelect.appendChild(option);
  });

  monthSelect.addEventListener('change', () => {
    currentMonth = parseInt(monthSelect.value);
    generateCalendar(currentMonth, currentYear);
  });
}

// Generate calendar for a given month/year
function generateCalendar(month, year) {
  if (!calendarEl) return;

  calendarEl.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  for(let i=0; i<firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.classList.add('day');
    calendarEl.appendChild(emptyCell);
  }

  for(let date=1; date<=lastDate; date++) {
    const dayCell = document.createElement('div');
    dayCell.classList.add('day');
    dayCell.dataset.date = `${year}-${month+1}-${date}`;
    dayCell.innerHTML = `<span>${date}</span>`;

    // Load existing entries
    const entry = userData.calendar[dayCell.dataset.date];
    if(entry) {
      if(entry.meal) addEntryBox(dayCell, entry.meal, "meal");
      if(entry.workout) addEntryBox(dayCell, entry.workout, "workout");
    }

    // Click to add entry
    dayCell.addEventListener('click', () => {
      selectedDateEl.textContent = dayCell.dataset.date;
      mealInput.value = entry?.meal || "";
      workoutInput.value = entry?.workout || "";
      entryForm.classList.remove('hidden');
    });

    calendarEl.appendChild(dayCell);
  }

  updateUpcomingEvents();
}

// Add meal/workout box inside a day cell
function addEntryBox(dayCell, text, type) {
  const box = document.createElement('div');
  box.classList.add('entry-box');
  if(type==="meal") box.classList.add('meal-box');
  else box.classList.add('workout-box');

  box.textContent = text;

  // Click to expand/collapse
  box.addEventListener('click', e => {
    e.stopPropagation();
    box.classList.toggle('expanded');
  });

  dayCell.appendChild(box);
}

// --------------------------
// 5. Save Calendar Entry
// --------------------------
if (saveEntryBtn) {
  saveEntryBtn.addEventListener('click', () => {
    const date = selectedDateEl.textContent;
    if(!userData.calendar[date]) userData.calendar[date] = {};
    userData.calendar[date].meal = mealInput.value;
    userData.calendar[date].workout = workoutInput.value;
    saveUserData(userData);
    entryForm.classList.add('hidden');
    generateCalendar(currentMonth, currentYear);
  });
}

if (closeFormBtn) {
  closeFormBtn.addEventListener('click', () => {
    entryForm.classList.add('hidden');
  });
}

// --------------------------
// 6. Upcoming Events
// --------------------------
function updateUpcomingEvents() {
  if (!upcomingEventsEl) return;
  upcomingEventsEl.innerHTML = "";
  const today = new Date();
  for(let i=0;i<7;i++) { // next 7 days
    const d = new Date(today);
    d.setDate(today.getDate()+i);
    const key = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    const entry = userData.calendar[key];
    const div = document.createElement('div');
    div.textContent = `${d.getMonth()+1}/${d.getDate()}: `;
    if(entry) {
      div.innerHTML += `Meal: ${entry.meal || "Nothing Yet"}<br>Workout: ${entry.workout || "Nothing Yet"}`;
    } else {
      div.innerHTML += "Nothing Yet";
    }
    upcomingEventsEl.appendChild(div);
  }
}

// --------------------------
// 7. Motivational Quotes (12-hour change)
// --------------------------
const quotes = [
  "Push yourself, because no one else is going to do it for you.",
  "Sweat is just fat crying.",
  "No pain, no gain.",
  "Strive for progress, not perfection.",
  "The harder you work, the luckier you get."
];

const quoteBox = document.getElementById('quoteBox');

function updateQuote() {
  if (!quoteBox) return;
  const index = Math.floor((Date.now()/(12*60*60*1000)) % quotes.length);
  quoteBox.textContent = quotes[index];
}

updateQuote();
setInterval(updateQuote, 60*60*1000);

// --------------------------
// 8. Initial Calendar Load
// --------------------------
generateCalendar(currentMonth, currentYear);