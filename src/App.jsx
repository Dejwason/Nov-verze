import { useEffect, useState, useRef } from "react";

export default function KartotekaApp() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("udaje");
  const [newPatientName, setNewPatientName] = useState("");
  const [role, setRole] = useState("student");
  const [searchTerm, setSearchTerm] = useState("");
  const [newPrescription, setNewPrescription] = useState("");
  const prescriptionRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("patients");
    if (stored) setPatients(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("patients", JSON.stringify(patients));
  }, [patients]);

  const addPatient = () => {
    if (newPatientName.trim() === "") return;
    setPatients([...patients, {
      name: newPatientName,
      birthdate: "", gender: "", contact: "", address: "",
      visits: [], prescriptions: []
    }]);
    setNewPatientName("");
  };

  const updatePatientField = (field, value) => {
    const updated = [...patients];
    updated[selectedPatientIndex][field] = value;
    setPatients(updated);
  };

  const deletePatient = (index) => {
    const updated = patients.filter((_, i) => i !== index);
    setPatients(updated);
    setSelectedPatientIndex(null);
  };

  const handleRoleChange = (e) => {
    if (prompt("Zadejte heslo pro roli učitele:") !== "ucitel123" && e.target.value === "teacher") {
      alert("Nesprávné heslo. Zůstáváte jako žák.");
      return;
    }
    setRole(e.target.value);
    setSelectedPatientIndex(null);
    setActiveTab("udaje");
  };

  const handleAddPrescription = () => {
    if (newPrescription.trim() === "") return;
    const updated = [...patients];
    updated[selectedPatientIndex].prescriptions.push(newPrescription);
    setPatients(updated);
    setNewPrescription("");
  };

  const printPrescription = () => {
    const content = prescriptionRef.current.innerHTML;
    const win = window.open("", "", "width=800,height=600");
    win.document.write('<html><head><title>Recept</title></head><body>' + content + '</body></html>');
    win.document.close();
    win.print();
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      <h1>🩺 Elektronická kartotéka</h1>

      <label>Role: </label>
      <select value={role} onChange={handleRoleChange}>
        <option value="student">Žák</option>
        <option value="teacher">Učitel</option>
      </select>

      <div style={{ margin: "1rem 0" }}>
        <input
          placeholder="Hledat pacienta"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {role === "teacher" && (
          <>
            <input
              placeholder="Jméno pacienta"
              value={newPatientName}
              onChange={(e) => setNewPatientName(e.target.value)}
            />
            <button onClick={addPatient}>Přidat</button>
          </>
        )}
      </div>

      <ul>
        {filteredPatients.map((p, i) => (
          <li key={i} onClick={() => setSelectedPatientIndex(i)}>
            {p.name}
            {role === "teacher" && (
              <button onClick={(e) => { e.stopPropagation(); deletePatient(i); }}>Smazat</button>
            )}
          </li>
        ))}
      </ul>

      {selectedPatientIndex !== null && (
        <div>
          <h2>Karta pacienta</h2>
          <div>
            <button onClick={() => setActiveTab("udaje")}>Údaje</button>
            <button onClick={() => setActiveTab("predpis")}>Předpis</button>
          </div>

          {activeTab === "udaje" && (
            <>
              <p><strong>Jméno:</strong> {patients[selectedPatientIndex].name}</p>
              {role === "teacher" ? (
                <>
                  <input placeholder="Datum narození" value={patients[selectedPatientIndex].birthdate} onChange={(e) => updatePatientField("birthdate", e.target.value)} /><br />
                  <input placeholder="Pohlaví" value={patients[selectedPatientIndex].gender} onChange={(e) => updatePatientField("gender", e.target.value)} /><br />
                  <input placeholder="Kontakt" value={patients[selectedPatientIndex].contact} onChange={(e) => updatePatientField("contact", e.target.value)} /><br />
                  <input placeholder="Adresa" value={patients[selectedPatientIndex].address} onChange={(e) => updatePatientField("address", e.target.value)} />
                </>
              ) : (
                <>
                  <p><strong>Datum narození:</strong> {patients[selectedPatientIndex].birthdate}</p>
                  <p><strong>Pohlaví:</strong> {patients[selectedPatientIndex].gender}</p>
                  <p><strong>Kontakt:</strong> {patients[selectedPatientIndex].contact}</p>
                  <p><strong>Adresa:</strong> {patients[selectedPatientIndex].address}</p>
                </>
              )}
            </>
          )}

          {activeTab === "predpis" && (
            <>
              <textarea
                placeholder="Předepsat lék..."
                value={newPrescription}
                onChange={(e) => setNewPrescription(e.target.value)}
              /><br />
              <button onClick={handleAddPrescription}>Uložit</button>
              <button onClick={printPrescription}>Tisk</button>
              <div ref={prescriptionRef}>
                <h3>Recept</h3>
                <p>Pacient: {patients[selectedPatientIndex].name}</p>
                <p>Předpis: {newPrescription}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
