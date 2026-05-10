/*
  Schema system (ENKEL FUNGERANDE VERSION)
  
  Changes vs original:
  - Absorbed createCalendar, updateMonthLabel, updateClock from inline <script> in index.html
  - Fixed: today-check was outside the for-loop (so li/day were out of scope)
  - Fixed: day cells now store data-month and data-year so filtering works when navigating months
  - Fixed: deleteSchema now uses index correctly to avoid removing wrong entry
  - Added: Swedish holidays (fasta + rörliga via Gauss påskalgoritm)
  - Added: holiday label rendered on calendar cell + is-holiday CSS class
*/

// ==============================
// STATE (moved from inline script)
// ==============================
let currentMonth = new Date().getMonth();
let currentYear  = new Date().getFullYear();

// ==============================
// SVENSKA HELGDAGAR
// ==============================
const fastaHelgdagar = {
  // key = "dag-månad(0-baserad)"
  "1-0":   "Nyårsdagen",
  "6-0":   "Trettondag jul",
  "1-4":   "Första maj",
  "6-5":   "Sveriges nationaldag",
  "24-11": "Julafton",
  "25-11": "Juldagen",
  "26-11": "Annandag jul",
  "31-11": "Nyårsafton",
};

function getRorligaHelgdagar(year) {
  // Gauss algorithm for Easter Sunday
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const paskMonth = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-based
  const paskDay   = ((h + l - 7 * m + 114) % 31) + 1;

  const pask = new Date(year, paskMonth, paskDay);
  const result = {};

  function add(offsetDays, name) {
    const d = new Date(pask);
    d.setDate(d.getDate() + offsetDays);
    result[`${d.getDate()}-${d.getMonth()}`] = name;
  }

  add(-2,  "Långfredagen");
  add(0,   "Påskdagen");
  add(1,   "Annandag påsk");
  add(39,  "Kristi himmelsfärd");
  add(49,  "Pingstdagen");

  // Midsommarafton = first Friday on or after June 19
  let mid = new Date(year, 5, 19);
  while (mid.getDay() !== 5) mid.setDate(mid.getDate() + 1);
  result[`${mid.getDate()}-5`] = "Midsommarafton";
  const middag = new Date(mid);
  middag.setDate(mid.getDate() + 1);
  result[`${middag.getDate()}-5`] = "Midsommardagen";

  // Alla helgons dag = first Saturday on or after Oct 31
  let alla = new Date(year, 9, 31);
  while (alla.getDay() !== 6) alla.setDate(alla.getDate() + 1);
  result[`${alla.getDate()}-9`] = "Alla helgons dag";

  return result;
}

function getHelgdagar(year) {
  return Object.assign({}, fastaHelgdagar, getRorligaHelgdagar(year));
}

// ==============================
// LOCAL STORAGE
// ==============================
function loadScheman() {
  return JSON.parse(localStorage.getItem("scheman")) || [];
}

function saveScheman(scheman) {
  localStorage.setItem("scheman", JSON.stringify(scheman));
}

// ==============================
// KLOCKA (moved from inline script)
// ==============================
function updateClock() {
  const now = new Date();

  const time = now.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const date = now.toLocaleDateString("sv-SE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  document.getElementById("current-time").textContent = time;
  document.getElementById("current-date").textContent = date;
}

// ==============================
// SKAPA KALENDER (moved + fixed from inline script)
// ==============================
// tog hjälp av AI för CreateCalendar och UpdateMonthLabel
function createCalendar() {
  const calendar = document.getElementById("calendar");
  const helgdagar = getHelgdagar(currentYear);

  // Rensa gamla dagar
  calendar.querySelectorAll(".content").forEach(el => el.remove());

  const today = new Date();
  const year  = currentYear;
  const month = currentMonth;

  const firstDay = new Date(year, month, 1);
  let startDay = firstDay.getDay();
  // Gör måndag till första dagen
  startDay = startDay === 0 ? 6 : startDay - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Tomma rutor
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("li");
    empty.className = "content empty";
    calendar.appendChild(empty);
  }

  // Dagar
  for (let day = 1; day <= daysInMonth; day++) {
    const li = document.createElement("li");
    li.className = "content";
    li.dataset.dag   = day;
    li.dataset.month = month;  // Fixed: needed for cross-month filtering
    li.dataset.year  = year;   // Fixed: needed for cross-month filtering

    // Fixed: today-check was outside the for-loop in original (li/day out of scope)
    if (
      day   === today.getDate() &&
      month === today.getMonth() &&
      year  === today.getFullYear()
    ) {
      li.classList.add("today");
    }

    // Helgdag?
    const helgKey  = `${day}-${month}`;
    const helgNamn = helgdagar[helgKey];
    if (helgNamn) {
      li.classList.add("is-holiday");
    }

    li.onclick = function () {
      valDag(this);
    };

    li.innerHTML = `
      <div class="taskAmount"></div>
      <span>${day}</span>
      ${helgNamn ? `<span class="holiday-label">${helgNamn}</span>` : ""}
    `;

    calendar.appendChild(li);
  }

  uppdateraBorders();
}

// ==============================
// MÅNADSNAMN (moved from inline script)
// ==============================
function updateMonthLabel() {
  const monthNames = [
    "Januari", "Februari", "Mars", "April", "Maj", "Juni",
    "Juli", "Augusti", "September", "Oktober", "November", "December"
  ];
  document.getElementById("monthLabel").textContent =
    `${monthNames[currentMonth]} ${currentYear}`;
}

// ==============================
// VÄLJ DAG
// ==============================
let valdDag = "";

function visaSchemaForDag(dag) {
  valdDag = dag;
  uppdateraBorders();

  const dagDisplay = document.getElementById("schema-dag-text");
  const dagPanel   = document.getElementById("schema-vald-dag");
  const lista      = document.getElementById("schema-lista");

  dagPanel.style.display = "flex";
  dagDisplay.textContent  = `Dag ${dag}`;

  const scheman      = loadScheman();
  const dagensSchema = scheman.filter(
    s => s.dag === dag && s.month === currentMonth && s.year === currentYear
  );

  if (dagensSchema.length === 0) {
    lista.innerHTML = `
      <li class="schema-tomt">
        Inget schema för dag ${dag}
      </li>
    `;
    return;
  }

  lista.innerHTML = dagensSchema.map((s, i) => `
    <li class="schema-item">
      <div class="schema-item-text">${s.text}</div>
      <button class="schema-item-delete" onclick="deleteSchema(${i}, '${dag}')">
        X
      </button>
    </li>
  `).join("");
}

// ==============================
// ADD SCHEMA (KNAPPEN)
// ==============================
function addSchema() {
  const text = document
    .getElementById("schema-text")
    .value
    .trim();

  if (!valdDag) {
    alert("Välj en dag först!");
    return;
  }

  if (!text) {
    alert("Skriv något!");
    return;
  }

  const scheman = loadScheman();

  scheman.push({
    dag:   valdDag,
    month: currentMonth,
    year:  currentYear,
    text:  text
  });

  saveScheman(scheman);
  visaSchemaForDag(valdDag);
  uppdateraBorders();

  document.getElementById("schema-text").value = "";
}

// ==============================
// DELETE
// Fixed: original used filter-by-text which could delete wrong entry if text was identical
// ==============================
function deleteSchema(index, dag) {
  const scheman      = loadScheman();
  const dagensSchema = scheman.filter(
    s => s.dag === dag && s.month === currentMonth && s.year === currentYear
  );

  const attTaBort = dagensSchema[index];
  if (!attTaBort) return;

  // Find and remove the first exact match
  const idx = scheman.findIndex(
    s => s.dag === attTaBort.dag &&
         s.month === attTaBort.month &&
         s.year  === attTaBort.year  &&
         s.text  === attTaBort.text
  );
  if (idx !== -1) scheman.splice(idx, 1);

  saveScheman(scheman);
  visaSchemaForDag(dag);
  uppdateraBorders();
}

// ==============================
// VÄLJ DAG (via kalendern)
// ==============================
function valDag(el) {
  valdDag = el.dataset.dag;

  // Remove active class from all days
  document.querySelectorAll(".calendar .content").forEach(li => {
    li.classList.remove("day-active");
  });

  // Mark clicked day as active
  el.classList.add("day-active");

  // Show the panel for this day
  visaSchemaForDag(valdDag);

  // Reveal the text input (it starts hidden)
  document.getElementById("schema-text").classList.remove("hidden");
}

// Refresh green borders for all days that have schedule entries
function uppdateraBorders() {
  const scheman = loadScheman();
  document.querySelectorAll(".calendar .content").forEach(li => {
    const dag   = li.dataset.dag;
    const month = parseInt(li.dataset.month);
    const year  = parseInt(li.dataset.year);

    const harSchema = scheman.filter(
      s => s.dag == dag && s.month === month && s.year === year
    );

    // Update badge count
    const badge = li.querySelector(".taskAmount");
    if (badge) {
      badge.textContent = harSchema.length > 0 ? harSchema.length : "";
    }

    // Don't overwrite the active (blue) selection
    if (!li.classList.contains("day-active")) {
      li.classList.toggle("day-has-schema", harSchema.length > 0);
    }
  });
}

// ==============================
// INIT
// ==============================
function initSchema() {
  document
    .getElementById("add-schema-btn")
    .addEventListener("click", addSchema);

  // tog hjälp av AI för detta
  document.getElementById("prevMonth").onclick = () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    createCalendar();
    updateMonthLabel();
  };

  document.getElementById("nextMonth").onclick = () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    createCalendar();
    updateMonthLabel();
  };

  createCalendar();
  updateMonthLabel();
  uppdateraBorders();

  // Clock
  updateClock();
  setInterval(updateClock, 1000);
}

document.addEventListener("DOMContentLoaded", initSchema);