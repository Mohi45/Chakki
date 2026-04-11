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

            // ✅ LOAD SAFE ARRAYS
            sales = Array.isArray(d.sales) ? d.sales : [];
            expenses = Array.isArray(d.expenses) ? d.expenses : [];
            purchase = Array.isArray(d.purchase) ? d.purchase : [];
            udhaar = Array.isArray(d.udhaar) ? d.udhaar : [];
            pisai = Array.isArray(d.pisai) ? d.pisai : [];
            payments = Array.isArray(d.payments) ? d.payments : [];
            lastEntries = Array.isArray(d.lastEntries) ? d.lastEntries : [];

            // 🔥 AUTO CALCULATE STOCK (REAL FIX)
            let totalPurchaseKg = purchase.reduce((a, b) => a + Number(b.kg || 0), 0);
            let totalSoldKg = sales.reduce((a, b) => a + Number(b.kg || 0), 0);

            stock = totalPurchaseKg - totalSoldKg;

            console.log("📦 Stock Calculated:", stock);

            render();
        }, (error) => {
            console.error("❌ Firestore Error:", error);
        });
}

// ===================== SAVE DATA =====================
function saveData() {

    db.collection("data").doc("main")
        .set({
            sales,
            expenses,
            purchase,
            udhaar,
            pisai,
            payments,
            stock: Number(stock),
            lastEntries
        }, { merge: true }) // ✅ IMPORTANT
        .then(() => console.log("✅ Saved"))
        .catch(err => console.error(err));
}