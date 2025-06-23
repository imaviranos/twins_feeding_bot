import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "https://script.google.com/macros/s/AKfycbxrTE54sSKDSmy-bmOpZPuliuxyWTG0LFbKV3FiixbXzY-AaOupWD7FiWUHmHVvd4Bb/exec";

function App() {
  const [baby, setBaby] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (baby) fetchHistory(baby);
  }, [baby]);

  const fetchHistory = async (name) => {
    try {
      const res = await fetch(`${API_URL}?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (err) {
      console.error("שגיאה בשליפת היסטוריה", err);
    }
  };

  const handleSubmit = async () => {
    if (!baby || !amount) {
      setMessage("יש למלא את כל השדות");
      return;
    }

    setMessage("שולח...");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ name: baby, amount: Number(amount) }),
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();

      if (result.status === "success") {
        setMessage(`${baby} אכל/ה ${amount} מ"ל`);
        setAmount("");
        fetchHistory(baby);
      } else {
        setMessage("שגיאה בהרשאה");
      }
    } catch (err) {
      setMessage("שגיאה בשליחה");
    }
  };

  return (
    <div className="container">
      <h1>סוכן האכלה 👶</h1>
      <label>בחר תינוק:</label>
      <select value={baby} onChange={(e) => setBaby(e.target.value)}>
        <option value="">בחר שם</option>
        <option value="תינוק 1">תינוק 1</option>
        <option value="תינוק 2">תינוק 2</option>
      </select>

      <label>כמות (מ"ל):</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="לדוגמה: 90"
      />

      <button onClick={handleSubmit}>שמור האכלה</button>

      {message && <p className="message">{message}</p>}

      {history.length > 0 && (
        <div className="history">
          <h3>2 האכלות אחרונות:</h3>
          <ul>
            {history.map((h, idx) => (
              <li key={idx}>
                {new Date(h.timestamp).toLocaleString("he-IL")} – {h.amount} מ"ל
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
