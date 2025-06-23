import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "/api/feed";

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
      const text = await res.text();
      const data = JSON.parse(text);
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

      const text = await res.text();
      console.log("תשובת השרת:", text);

      try {
        const result = JSON.parse(text);
        if (result.status === "success") {
          setMessage(`${baby} אכל/ה ${amount} מ"ל`);
          setAmount("");
          fetchHistory(baby);
        } else {
          setMessage("שגיאה בהרשאה");
        }
      } catch (parseErr) {
        console.error("שגיאה בפירוש התשובה מהשרת", parseErr);
        setMessage("שגיאה בשליחה (פירוש)");
      }

    } catch (err) {
      console.error("שגיאה בשליחה:", err);
      setMessage("שגיאה בשליחה (רשת)");
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