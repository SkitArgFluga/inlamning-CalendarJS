/*
-Visar schema när man klickar på en dag i kalendern
-kopplar veckodag från kalender till schema-panelen

*/
//GetDay() ger 0-6, vi vill ha svenska namn
const VECKODAGAR_SVENSKA=[
    'söndag',  //0
    'måndag',  //1
    'tisdag',  //2
    'onsdag',  //3
    'torsdag', //4
    'fredag',  //5
    'lördag',  //6
];



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

  if (!dag) {
    alert("Klicka på en dag i kalendern först!");
    return;
  }

if(!text){
    alert("Skriv vad som händer")
}
  const scheman = loadScheman();

  scheman.push({
    dag,
    text,
    fran,
    till
  });

  saveScheman(scheman);

//visa uppdaterad lista
visaSchemaForDag(dag);

//Återställa textfältet
  document.getElementById("schema-text").value = "";
}

// Visa lista (filtrerar per vald dag)
function visaSchemaForDag(dag) {
  const lista = document.getElementById("schema-lista");
  const dagText= document.getElementById("schema-dag-text");
  const dagPanel= document.getElementById("schema-vald-dag")
  const valdDag = document.getElementById("schema-dag");

  //spara vald dag 
  document.getElementById("schema-dag").value=dag;

  //Visa "Vald dag: Måndag"
  dagPanel.style.display='flex';
  dagText.textContent= dag.charAt(0).toUpperCase()+ dag.slice(1);
  //chartAt(0).touppercase()= gör första bokstaven stor

  //visa inputfält
  document.getElementById("schema-text")
  .classList.remove("hidden");

  //Hämta ala scheman och filterera på vald dag
  const scheman= loadScheman();
  const filtrerade= scheman.filter(s => s.dag ===dag);

  // Tom lista
  if (filtrerade.length === 0) {
    lista.innerHTML = `
      <li class="schema-tom">
        Inget schema för ${dag}
      </li>
    `;
    return;
  }
  lista.innerHTML = filtrerade.map((s, index)=> `
    <li class="schema-item">
      <div class="schema-item-dag">${s.dag}</div>
      <div class="schema-item-text">${s.text}</div>
      <div class="schema-item-tid">${s.fran} - ${s.till}</div>
      <button
      class="schema-delete-btn"
      onclick="deleteSchema(${index}, '${dag}')"
      title="Ta bort"
      >X</button>
    </li>
  `).join("");
}
//Ta bort schema
function deleteSchema(index, dag){
    const scheman= loadScheman();
    scheman.splice(index, 1);
    saveScheman(scheman);
    visaSchemaForDag(dag);
}

// Start
function initSchema() {
  document.getElementById("add-schema-btn")
    .addEventListener("click", addSchema);
}