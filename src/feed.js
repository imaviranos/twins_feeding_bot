export default async function handler(req, res) {
  const API_URL = "https://script.google.com/macros/s/AKfycbwNKrjjBhX6zJsdusO3YEHSrjsbzt17dDvzrrU4AOcyNs5IQR3PLNbYDd-7XhCg_ynP/exec";

  if (req.method === "POST") {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });

      const data = await response.text(); // fallback to text for Google Script
      res.status(200).send(data);
    } catch (err) {
      console.error("שגיאה בשליחה ל-Google Script:", err);
      res.status(500).json({ status: "error", message: "שליחה נכשלה" });
    }
  } else if (req.method === "GET") {
    try {
      const { name } = req.query;
      const response = await fetch(`${API_URL}?name=${encodeURIComponent(name)}`);
      const data = await response.text(); // again: Google Script sometimes returns text
      res.status(200).send(data);
    } catch (err) {
      console.error("שגיאה בשליפת מידע מה-Google Script:", err);
      res.status(500).json({ status: "error", message: "שליפה נכשלה" });
    }
  } else {
    res.status(405).json({ status: "error", message: "Method Not Allowed" });
  }
}