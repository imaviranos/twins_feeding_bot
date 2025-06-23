from telegram.ext import Updater, MessageHandler, Filters
from gspread import authorize
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime

# 🔑 טוקן מה-BotFather
TOKEN = '7651114800:AAE93ltIanzre0_xe7oX_lZGkzXUA0dZZxQ'
SHEET_NAME = 'תיעוד האכלות'

# התחברות ל-Google Sheets
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name("attached_assets/credentials.json", scope)
client = authorize(creds)
sheet = client.open(SHEET_NAME).sheet1

# מחזיר 2 האכלות אחרונות של התינוק
def get_last_feedings(name, count=2):
    records = sheet.get_all_records()
    filtered = [r for r in records if r['שם תינוק'] == name]
    last_feedings = filtered[-count:] if len(filtered) >= count else filtered
    return last_feedings[::-1]  # חדש קודם

# טיפול בהודעה מהמשתמש
def handle_message(update, context):
    text = update.message.text
    try:
        parts = text.strip().split()
        name = parts[0]
        amount = int(parts[2] if parts[1] in ["אכלה", "אכל"] else parts[1])

        now = datetime.now().strftime("%Y-%m-%d %H:%M")
        sheet.append_row([now, name, amount, ""])

        history = get_last_feedings(name, count=3)
        prev_feedings = history[1:] if len(history) > 1 else []

        response = f"רשמתי: {name} – {amount} מ\"ל ב־{now}"
        if not prev_feedings:
            response += "\nזוהי ההאכלה הראשונה שנרשמה עבורו."
        else:
            for i, entry in enumerate(prev_feedings):
                previous_time = entry['תאריך ושעה']
                previous_amount = entry['כמות']
                response += f"\nהאכלה {i+1} לפני: {previous_time} – {previous_amount} מ\"ל"
    except Exception as e:
        print("שגיאה:", e)
        response = "נסה לשלוח משהו כמו: נועה אכלה 90"

    update.message.reply_text(response)

# הרצת הבוט
def main():
    updater = Updater(TOKEN, use_context=True)
    dp = updater.dispatcher
    dp.add_handler(MessageHandler(Filters.text & ~Filters.command, handle_message))
    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()

