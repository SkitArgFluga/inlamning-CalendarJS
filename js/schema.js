/*
- Visar schema när man klickar på en dag i kalendern
- Kopplar veckodag från kalender till schema-panelen
*/

// Svenska veckodagar
const VECKODAGAR_SVENSKA = [
  "söndag",
  "måndag",
  "tisdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lördag",
];

// ==============================
// LOCAL STORAGE
// ==============================

// Hämta sparade scheman
function loadScheman() {
  const data = localStorage.getItem("scheman");
  return data ? JSON.parse(data) : [];
}

// Spara scheman
function saveScheman(scheman) {
  localStorage.setItem("scheman", JSON.stringify(scheman));
}

// ==============================
// VÄLJ DAG
// ==============================

function visaSchemaForDag(dag) {

  // Element
  const lista = document.getElementById("schema-lista");
  const dagPanel = document.getElementById("schema-vald-dag");
  const dagText = document.getElementById("schema-dag-text");

  // Spara vald dag i hidden input
  document.getElementById("schema-dag").value = dag;

  // Visa rutan med vald dag
  dagPanel.style.display = "flex";

  // Skriv dag med stor bokstav
  dagText.textContent =
    dag.charAt(0).toUpperCase() + dag.slice(1);
    dagDisplay.classList.remove("hidden");

dagDisplay.textContent =
  dag.charAt(0).toUpperCase() + dag.slice(1);

  // Hämta scheman
  const scheman = loadScheman();

  // Filtrera på vald dag
  const filtrerade = scheman.filter(
    s => s.dag === dag
  );

  // Om inga scheman finns
  if (filtrerade.length === 0) {

    lista.innerHTML = `
      <li class="schema-tom">
        Inget schema för ${dag}
      </li>
    `;

    return;
  }

  // Visa schema-lista
  lista.innerHTML = filtrerade.map((s, index) => `
    <li class="schema-item">

      <div class="schema-item-dag">
        ${s.dag}
      </div>

      <div class="schema-item-text">
        ${s.text}
      </div>

      <div class="schema-item-tid">
        ${s.fran} - ${s.till}
      </div>

      <button
        class="schema-delete-btn"
        onclick="deleteSchema(${index}, '${dag}')"
      >
        X
      </button>

    </li>
  `).join("");
}

// ==============================
// LÄGG TILL SCHEMA
// ==============================

function addSchema() {

  // Hidden input (från kalender)
  let dag =
    document.getElementById("schema-dag").value;

  // Om ingen kalenderdag valts:
  // använd dropdown
  if (!dag) {

    dag =
      document.getElementById("schema-dag-select").value;
  }

  // Inputs
  const text =
    document.getElementById("schema-text")
    .value
    .trim();

  const fran =
    document.getElementById("schema-fran").value;

  const till =
    document.getElementById("schema-till").value;

  // Validering
  if (!dag) {
    alert("Välj en dag först!");
    return;
  }

  if (!text) {
    alert("Skriv vad som händer!");
    return;
  }

  // Hämta gamla scheman
  const scheman = loadScheman();

  // Lägg till nytt
  scheman.push({
    dag,
    text,
    fran,
    till
  });

  // Spara
  saveScheman(scheman);

  // Visa uppdaterad lista
  visaSchemaForDag(dag);

  // Rensa textfält
  document.getElementById("schema-text").value = "";
}

// ==============================
// TA BORT SCHEMA
// ==============================

function deleteSchema(index, dag) {

  const scheman = loadScheman();

  // Filtrera bort rätt schema
  const nyaScheman =
    scheman.filter((s, i) => {

      return !(
        s.dag === dag &&
        i === index
      );

    });

  saveScheman(nyaScheman);

  // Uppdatera lista
  visaSchemaForDag(dag);
}

// ==============================
// INIT
// ==============================

function initSchema() {

  // Knappen fungerar nu
  document
    .getElementById("add-schema-btn")
    .addEventListener("click", addSchema);

  // När man väljer dag i dropdown
  document
    .getElementById("schema-dag-select")
    .addEventListener("change", (e) => {

      const dag = e.target.value;

      if (dag) {
        visaSchemaForDag(dag);
      }

    });

}