function addExpense() {
    let type = document.getElementById("type").value;
    let amt = parseFloat(document.getElementById("amt").value) || 0;

    if (!type || !amt) {
        alert("⚠️ Enter expense type & amount");
        return;
    }

    let now = new Date().toISOString();

    // ✅ SAVE EXPENSE (WITH DATE)
    expenses.push({
        type,
        amount: amt,
        date: now
    });

    // ✅ ADD LAST ENTRY (WITH INDEX FOR DELETE)
    addLastEntry({
        type: "expense",
        ref: "expenses",
        index: expenses.length - 1,
        amount: amt,
        text: `💸 ${type} - ₹${amt}`,
        time: getDateTime(),
        date: now
    });

    // ✅ SAVE + REFRESH
    saveData();

    // ✅ CLEAR INPUT
    document.getElementById("type").value = "";
    document.getElementById("amt").value = "";

    render();
}