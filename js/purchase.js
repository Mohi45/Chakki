function addPurchase() {
    let kg = parseFloat(document.getElementById("kg").value) || 0;
    let rate = parseFloat(document.getElementById("rate").value) || 0;

    if (!kg || !rate) {
        alert("⚠️ Enter kg & rate");
        return;
    }

    let amount = kg * rate;
    let now = new Date().toISOString();

    // ✅ SAVE PURCHASE (WITH DATE)
    purchase.push({
        kg,
        rate,
        amount,
        date: now
    });

    // ✅ UPDATE STOCK
    stock += kg;

    // ✅ ADD LAST ENTRY (WITH DATE + INDEX)
    addLastEntry({
        type: "purchase",
        ref: "purchase",
        index: purchase.length - 1,
        kg: kg,
        amount: amount,
        text: `🛒 Purchase ${kg}kg @ ₹${rate}`,
        time: getDateTime(),
        date: now
    });

    // ✅ SAVE
    saveData();

    // ✅ CLEAR INPUTS
    document.getElementById("kg").value = "";
    document.getElementById("rate").value = "";

    render();
}