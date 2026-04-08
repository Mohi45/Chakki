// 🔥 FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAfcvm5ttT7iFFIIyuarxFRITsrSW4MxCQ",
    authDomain: "attachakki-da798.firebaseapp.com",
    projectId: "attachakki-da798"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// ===================== LIVE SYNC =====================
function startLiveSync() {

    db.collection("data").doc("main")
        .onSnapshot((doc) => {

            console.log("🔥 Snapshot received");

            if (!doc.exists) {
                console.log("⚠️ No data found");
                return;
            }

            let d = doc.data();

            // ✅ LOAD ALL DATA SAFELY
            sales = Array.isArray(d.sales) ? d.sales : [];
            expenses = Array.isArray(d.expenses) ? d.expenses : [];
            purchase = Array.isArray(d.purchase) ? d.purchase : [];
            udhaar = Array.isArray(d.udhaar) ? d.udhaar : [];
            pisai = Array.isArray(d.pisai) ? d.pisai : [];
            payments = Array.isArray(d.payments) ? d.payments : [];
            lastEntries = Array.isArray(d.lastEntries) ? d.lastEntries : [];

            stock = Number(d.stock || 0);

            console.log("📦 Data Loaded:", d);

            render(); // 🔥 UI UPDATE
        }, (error) => {
            console.error("❌ Firestore Error:", error);
        });
}


// ===================== SAVE DATA =====================
function saveData() {

    let data = {
        sales,
        expenses,
        purchase,
        udhaar,
        pisai,
        payments,
        stock: Number(stock),
        lastEntries
    };

    console.log("💾 Saving Data:", data);

    // ❌ REMOVE merge:true → FULL REPLACE
    db.collection("data").doc("main")
        .set(data)
        .then(() => {
            console.log("✅ Data Saved");
        })
        .catch(err => {
            console.error("❌ Save Error:", err);
        });
}