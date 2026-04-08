function addExpense() {

    let type = document.getElementById("type").value;
    let amt = parseFloat(document.getElementById("amt").value) || 0;

    if (!type || !amt) {
        alert("⚠️ Enter expense type & amount");
        return;
    }

    let now = new Date().toISOString();

    // ✅ SAVE EXPENSE
    expenses.push({
        type,
        amount: amt,
        date: now
    });

    // ✅ LAST ENTRY (FIXED)
    addLastEntry({
        type: "expense",
        ref: "expenses",
        index: expenses.length - 1,
        amount: amt, // ✅ FIX
        text: `🟣 ${type} ₹${amt}`, // ✅ FIX
        time: getDateTime()
    });

    // ✅ SAVE
    saveData();

    // ✅ CLEAR INPUTS (WILL WORK NOW)
    document.getElementById("type").value = "";
    document.getElementById("amt").value = "";
    document.getElementById("type").focus(); // 🔥 better UX

    render();
}