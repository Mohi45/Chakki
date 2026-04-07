// 🔥 FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAfcvm5ttT7iFFIIyuarxFRITsrSW4MxCQ",
    authDomain: "attachakki-da798.firebaseapp.com",
    projectId: "attachakki-da798"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// 🔥 LIVE SYNC (REALTIME)
function startLiveSync() {
    db.collection("data").doc("main")
        .onSnapshot((doc) => {

            console.log("🔥 Snapshot received");

            if (!doc.exists) {
                console.log("⚠️ No data found");
                return;
            }

            let d = doc.data();
            console.log("📦 Firebase Data:", d);

            // ✅ LOAD ALL DATA
            sales = d.sales || [];
            expenses = d.expenses || [];
            purchase = d.purchase || [];
            udhaar = d.udhaar || [];
            pisai = d.pisai || [];
            payments = d.payments || [];
            stock = Number(d.stock || 0);

            // ✅ IMPORTANT (FIXED)
            lastEntries = d.lastEntries || [];

            console.log("✅ Stock Loaded:", stock);

            render(); // 🔥 UPDATE UI
        }, (error) => {
            console.error("❌ Firestore Error:", error);
        });
}


// 🔥 SAVE DATA (SAFE)
function saveData() {

    // 🛡️ Prevent empty overwrite
    if (
        !sales && !expenses && !purchase &&
        !udhaar && !pisai && !payments
    ) {
        console.warn("⚠️ Prevented empty save");
        return;
    }

    db.collection("data").doc("main")
        .set({
            sales,
            expenses,
            purchase,
            udhaar,
            pisai,
            payments,
            stock: Number(stock),

            // ✅ IMPORTANT (FIXED)
            lastEntries
        }, { merge: true })
        .then(() => {
            console.log("✅ Data Saved");
        })
        .catch(err => {
            console.error("❌ Save Error:", err);
        });
}