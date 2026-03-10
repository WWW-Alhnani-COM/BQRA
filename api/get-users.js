import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();
    
    try {
        const q = query(collection(db, "users"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
