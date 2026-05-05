// Hämta från localStorage
function loadScheman() {
  const data = localStorage.getItem("scheman");
  return data ? JSON.parse(data) : [];
}

// Spara
function saveScheman(scheman) {
  localStorage.setItem("scheman", JSON.stringify(scheman));
}

// Lägg till
function addSchema() {
  const dag = document.getElementById("schema-dag").value;
  const text = document.getElementById("schema-text").value.trim();
  const fran = document.getElementById("schema-fran").value;
  const till = document.getElementById("schema-till").value;

  if (!dag || !text) {
    alert("Fyll i dag och text!");
    return;
  }

  const scheman = loadScheman();

  scheman.push({
    dag,
    text,
    fran,
    till
  });

  saveScheman(scheman);
  renderScheman();

  document.getElementById("schema-text").value = "";
}

// Visa lista (filtrerar per vald dag 🔥)
function renderScheman() {
  const lista = document.getElementById("schema-lista");
  const valdDag = document.getElementById("schema-dag").value;
  const scheman = loadScheman();

  const filtrerade = valdDag
    ? scheman.filter(s => s.dag === valdDag)
    : scheman;

  if (filtrerade.length === 0) {
    lista.innerHTML = "<li>Inget schema</li>";
    return;
  }

  lista.innerHTML = filtrerade.map(s => `
    <li class="schema-item">
      <div class="schema-item-dag">${s.dag}</div>
      <div>${s.text}</div>
      <div class="schema-item-tid">${s.fran} - ${s.till}</div>
    </li>
  `).join("");
}

// Start
function initSchema() {
  document.getElementById("add-schema-btn")
    .addEventListener("click", addSchema);

  document.getElementById("schema-dag")
    .addEventListener("change", renderScheman);

  renderScheman();
}