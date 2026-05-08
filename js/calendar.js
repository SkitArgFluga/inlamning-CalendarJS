/*
Schema system (ENKEL FUNGERANDE VERSION)
*/

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
// VÄLJ DAG
// ==============================
let valdDag = "";

function visaSchemaForDag(dag) {

  valdDag = dag;
  uppdateraBorders();
  const dagDisplay = document.getElementById("schema-dag-text");
  const dagPanel = document.getElementById("schema-vald-dag");
  const lista = document.getElementById("schema-lista");

  dagPanel.style.display = "flex";

  dagDisplay.textContent = `Dag ${dag}`;

  const scheman = loadScheman();

  const dagensSchema = scheman.filter(s => s.dag === dag);

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

      <div class="schema-item-text">
        ${s.text}
      </div>

      <button onclick="deleteSchema(${i}, '${dag}')">
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
    dag: valdDag,
    text: text
  });

  saveScheman(scheman);

  visaSchemaForDag(valdDag);

  uppdateraBorders();

  document.getElementById("schema-text").value = "";
}

// ==============================
// DELETE
// ==============================
function deleteSchema(index, dag) {

  const scheman = loadScheman();

  const dagensSchema = scheman.filter(s => s.dag === dag);

  const schemaAttTaBort = dagensSchema[index];

  const nyaScheman = scheman.filter(s =>
    !(s.dag === schemaAttTaBort.dag &&
      s.text === schemaAttTaBort.text)
  );

  saveScheman(nyaScheman);

  visaSchemaForDag(dag);

  uppdateraBorders();
}

// ==============================
// LÄGG TILL DAG
// ==============================

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
    const dag = li.dataset.dag;
    const harSchema = scheman.filter(s => s.dag === dag);
    // Don't overwrite the active (blue) selection
    if (!li.classList.contains("day-active")) {
      li.classList.toggle("day-has-schema", harSchema);
    }

    if(harSchema.length > 0) {
    li.querySelector(".taskAmount").textContent = harSchema.length;
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

  uppdateraBorders();
  createCalendar();
}

document.addEventListener("DOMContentLoaded", initSchema);