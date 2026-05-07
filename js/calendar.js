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

  const dagDisplay = document.getElementById("schema-dag-text");
  const dagPanel = document.getElementById("schema-vald-dag");
  const lista = document.getElementById("schema-lista");

  dagPanel.style.display = "flex";
  dagDisplay.textContent =
    dag.charAt(0).toUpperCase() + dag.slice(1);

  const scheman = loadScheman();
  const filtrerade = scheman.filter(s => s.dag === dag);

  if (filtrerade.length === 0) {
    lista.innerHTML = `<li>Inget schema för ${dag}</li>`;
    return;
  }

  lista.innerHTML = filtrerade.map((s, i) => `
    <li class="schema-item">
      <div>${s.text}</div>
      <div>${s.fran} - ${s.till}</div>
      <button onclick="deleteSchema(${i}, '${dag}')">X</button>
    </li>
  `).join("");
}

// ==============================
// ADD SCHEMA (KNAPPEN)
// ==============================
function addSchema() {

  const text = document.getElementById("schema-text").value.trim();
  const fran = document.getElementById("schema-fran").value;
  const till = document.getElementById("schema-till").value;

  if (!valdDag) {
    alert("Välj en dag först!");
    return;
  }

  if (!text) {
    alert("Skriv vad som händer!");
    return;
  }

  const scheman = loadScheman();

  scheman.push({
    dag: valdDag,
    text,
    fran,
    till
  });

  saveScheman(scheman);

  visaSchemaForDag(valdDag);

  document.getElementById("schema-text").value = "";
}

// ==============================
// DELETE
// ==============================
function deleteSchema(index, dag) {
  const scheman = loadScheman();

  const filtrerade = scheman.filter(s => s.dag === dag);
  const bort = filtrerade[index];

  const nya = scheman.filter(s =>
    !(s.dag === bort.dag &&
      s.text === bort.text &&
      s.fran === bort.fran &&
      s.till === bort.till)
  );

  saveScheman(nya);
  visaSchemaForDag(dag);
}

// ==============================
// INIT
// ==============================
function initSchema() {

  document
    .getElementById("add-schema-btn")
    .addEventListener("click", addSchema);

}