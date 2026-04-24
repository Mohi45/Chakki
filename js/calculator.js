let isCalculatorOpen = false;

const calculatorState = {
    type: "sale",
    name: "",
    quantity: "",
    rate: "",
    gstEnabled: false,
    gstRate: "5",
    saleCustomer: "",
    pisaiCustomer: "",
    purchaseView: "total",
    purchaseDate: ""
};

const calculatorTypeConfig = {
    sale: {
        title: "Sale Calculator",
        nameLabel: "Product Name",
        namePlaceholder: "e.g. flour, bran",
        totalLabel: "Total Sale Amount"
    },
    pisai: {
        title: "Pisai Calculator",
        nameLabel: "Product / Service Name",
        namePlaceholder: "e.g. wheat grinding",
        totalLabel: "Total Pisai Amount"
    },
    purchase: {
        title: "Purchase Calculator",
        nameLabel: "Item Name",
        namePlaceholder: "e.g. wheat, rice",
        totalLabel: "Total Purchase Amount"
    },
    expense: {
        title: "Expense Calculator",
        nameLabel: "Expense Name",
        namePlaceholder: "e.g. transport, electricity",
        totalLabel: "Total Expense Amount"
    }
};

function getCalculatorTypeConfig(type) {
    return calculatorTypeConfig[type] || calculatorTypeConfig.sale;
}

function toggleCalculatorPanel() {
    if (!isLoggedIn) return;
    isCalculatorOpen = !isCalculatorOpen;
    renderCalculatorPanel();
}

function closeCalculatorPanel() {
    isCalculatorOpen = false;
    renderCalculatorPanel();
}

function setCalculatorType(type) {
    calculatorState.type = type;
    calculatorState.name = "";
    calculatorState.quantity = "";
    calculatorState.rate = type === "pisai" ? "1.90" : "";

    if (type !== "purchase") {
        calculatorState.purchaseView = "total";
        calculatorState.purchaseDate = "";
    }

    renderCalculatorPanel();
}

function setCalculatorField(field, value) {
    calculatorState[field] = value;
    renderCalculatorPanel();
}

function setCalculatorCustomer(source, value) {
    if (source === "sale") {
        calculatorState.saleCustomer = value;
    } else {
        calculatorState.pisaiCustomer = value;
    }

    renderCalculatorPanel();
}

function getUniqueNamesFromRecords(records) {
    const seen = new Set();

    return records
        .map(record => formatCustomerName(record.name))
        .filter(name => {
            const key = normalizeCustomerName(name);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => a.localeCompare(b));
}

function getPurchaseGroupsByDate() {
    const grouped = {};

    purchase.forEach(entry => {
        const key = String(entry.date || "").slice(0, 10);
        if (!key) return;

        if (!grouped[key]) {
            grouped[key] = {
                key,
                amount: 0,
                kg: 0,
                count: 0
            };
        }

        grouped[key].amount += Number(entry.amount || 0);
        grouped[key].kg += Number(entry.kg || 0);
        grouped[key].count += 1;
    });

    return Object.values(grouped).sort((a, b) => b.key.localeCompare(a.key));
}

function getCalculatorNumbers() {
    const quantity = Number(calculatorState.quantity || 0);
    const rate = Number(calculatorState.rate || 0);
    const subtotal = quantity * rate;
    const gstRate = Math.max(Number(calculatorState.gstRate || 0), 0);
    const gstAmount = calculatorState.gstEnabled ? (subtotal * gstRate) / 100 : 0;
    const grandTotal = subtotal + gstAmount;

    return { quantity, rate, subtotal, gstRate, gstAmount, grandTotal };
}

function getCalculatorValidationMessage() {
    if (calculatorState.quantity !== "" && Number(calculatorState.quantity) < 0) {
        return "Quantity cannot be negative.";
    }

    if (calculatorState.rate !== "" && Number(calculatorState.rate) < 0) {
        return "Rate cannot be negative.";
    }

    if ((calculatorState.quantity !== "" || calculatorState.rate !== "") && !String(calculatorState.name || "").trim()) {
        return "Enter a name before calculation.";
    }

    if (calculatorState.name && calculatorState.quantity === "") {
        return "Enter quantity in kg.";
    }

    if (calculatorState.name && calculatorState.rate === "") {
        return "Enter rate per kg.";
    }

    return "";
}

function getCalculatorInsightMarkup() {
    if (calculatorState.type === "sale") {
        const customers = getUniqueNamesFromRecords(sales);
        const selected = calculatorState.saleCustomer;
        const customerSales = sales.filter(item =>
            normalizeCustomerName(item.name) === normalizeCustomerName(selected)
        );
        const amount = customerSales.reduce((sum, item) => sum + Number(item.amount || 0), 0);

        return `
            <div class="calculator-field">
                <label>Saved Sale Customers</label>
                <select onchange="setCalculatorCustomer('sale', this.value)">
                    <option value="">Select sale customer</option>
                    ${customers.map(name => `<option value="${name}" ${selected === name ? "selected" : ""}>${name}</option>`).join("")}
                </select>
            </div>
            <div class="calculator-insight-card">
                <strong>Sale History</strong>
                <span>${selected ? `${customerSales.length} sale entries | ₹${amount.toFixed(2)}` : "Choose a sale customer to view previous total."}</span>
            </div>
        `;
    }

    if (calculatorState.type === "pisai") {
        const customers = getUniqueNamesFromRecords(pisai);
        const selected = calculatorState.pisaiCustomer;
        const customerPisai = pisai.filter(item =>
            normalizeCustomerName(item.name) === normalizeCustomerName(selected)
        );
        const amount = customerPisai.reduce((sum, item) => sum + Number(item.amount || 0), 0);

        return `
            <div class="calculator-field">
                <label>Saved Pisai Customers</label>
                <select onchange="setCalculatorCustomer('pisai', this.value)">
                    <option value="">Select pisai customer</option>
                    ${customers.map(name => `<option value="${name}" ${selected === name ? "selected" : ""}>${name}</option>`).join("")}
                </select>
            </div>
            <div class="calculator-insight-card">
                <strong>Pisai History</strong>
                <span>${selected ? `${customerPisai.length} pisai entries | ₹${amount.toFixed(2)}` : "Choose a pisai customer to view previous total."}</span>
            </div>
        `;
    }

    if (calculatorState.type === "purchase") {
        const groups = getPurchaseGroupsByDate();
        const selectedDate = calculatorState.purchaseDate || (groups[0] ? groups[0].key : "");
        const selectedGroup = groups.find(group => group.key === selectedDate);
        const totalAmount = purchase.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const totalKg = purchase.reduce((sum, item) => sum + Number(item.kg || 0), 0);

        return `
            <div class="calculator-field">
                <label>Purchase View</label>
                <select onchange="setCalculatorField('purchaseView', this.value)">
                    <option value="total" ${calculatorState.purchaseView === "total" ? "selected" : ""}>Total Purchase Amount</option>
                    <option value="datewise" ${calculatorState.purchaseView === "datewise" ? "selected" : ""}>Date Wise</option>
                </select>
            </div>
            ${calculatorState.purchaseView === "datewise" ? `
            <div class="calculator-field">
                <label>Purchase Date</label>
                <select onchange="setCalculatorField('purchaseDate', this.value)">
                    <option value="">Select purchase date</option>
                    ${groups.map(group => `<option value="${group.key}" ${selectedDate === group.key ? "selected" : ""}>${group.key}</option>`).join("")}
                </select>
            </div>` : ""}
            <div class="calculator-insight-card">
                <strong>Purchase Data</strong>
                <span>${calculatorState.purchaseView === "datewise"
                    ? (selectedGroup
                        ? `${selectedGroup.key} | ${selectedGroup.count} entries | ${selectedGroup.kg.toFixed(2)} kg | ₹${selectedGroup.amount.toFixed(2)}`
                        : "Select a date to view purchase total.")
                    : `${purchase.length} purchase entries | ${totalKg.toFixed(2)} kg | ₹${totalAmount.toFixed(2)}`}</span>
            </div>
        `;
    }

    return `
        <div class="calculator-insight-card">
            <strong>Quick Expense Help</strong>
            <span>Enter name, quantity, and rate to get the expense amount instantly.</span>
        </div>
    `;
}

function renderCalculatorPanel() {
    const host = document.getElementById("calculatorPanelHost");
    const toggleBtn = document.getElementById("calculatorToggle");

    if (!host) return;

    if (!isLoggedIn) {
        host.innerHTML = "";
        if (toggleBtn) toggleBtn.style.display = "none";
        return;
    }

    if (toggleBtn) {
        toggleBtn.style.display = "inline-block";
        toggleBtn.textContent = typeof t === "function"
            ? (isCalculatorOpen ? t("closeCalculator") : t("calculator"))
            : (isCalculatorOpen ? "Close Calc" : "Calculator");
    }

    if (!isCalculatorOpen) {
        host.innerHTML = "";
        return;
    }

    const config = getCalculatorTypeConfig(calculatorState.type);
    const { subtotal, gstAmount, grandTotal } = getCalculatorNumbers();
    const validationMessage = getCalculatorValidationMessage();

    host.innerHTML = `
        <div class="card calculator-panel">
            <div class="calculator-panel-top">
                <div>
                    <p class="calculator-eyebrow">Quick Calculator</p>
                    <h3>${config.title}</h3>
                    <p class="calculator-subtitle">Toggle-based calculator with saved customer and purchase data.</p>
                </div>
                <button type="button" class="calculator-close-btn" onclick="closeCalculatorPanel()">Close</button>
            </div>

            <div class="calculator-toolbar">
                <div class="calculator-field">
                    <label>Transaction Type</label>
                    <select onchange="setCalculatorType(this.value)">
                        <option value="sale" ${calculatorState.type === "sale" ? "selected" : ""}>Sale</option>
                        <option value="pisai" ${calculatorState.type === "pisai" ? "selected" : ""}>Pisai</option>
                        <option value="purchase" ${calculatorState.type === "purchase" ? "selected" : ""}>Purchase</option>
                        <option value="expense" ${calculatorState.type === "expense" ? "selected" : ""}>Expense</option>
                    </select>
                </div>

                <div class="calculator-field">
                    <label>GST Rate (%)</label>
                    <input type="number" min="0" step="0.01" value="${calculatorState.gstRate}" oninput="setCalculatorField('gstRate', this.value)">
                </div>

                <label class="calculator-toggle-switch">
                    <input type="checkbox" ${calculatorState.gstEnabled ? "checked" : ""} onchange="setCalculatorField('gstEnabled', this.checked)">
                    <span>Add GST</span>
                </label>
            </div>

            <div class="calculator-toolbar">
                ${getCalculatorInsightMarkup()}
            </div>

            <div class="calculator-grid">
                <div class="calculator-field">
                    <label>${config.nameLabel}</label>
                    <input type="text" value="${calculatorState.name}" placeholder="${config.namePlaceholder}" oninput="setCalculatorField('name', this.value)">
                </div>

                <div class="calculator-field">
                    <label>Quantity (kg)</label>
                    <input type="number" min="0" step="0.01" value="${calculatorState.quantity}" placeholder="0" oninput="setCalculatorField('quantity', this.value)">
                </div>

                <div class="calculator-field">
                    <label>Rate per kg</label>
                    <input type="number" min="0" step="0.01" value="${calculatorState.rate}" placeholder="0" oninput="setCalculatorField('rate', this.value)">
                </div>
            </div>

            <p class="calculator-global-error">${validationMessage}</p>

            <div class="calculator-summary">
                <div class="calculator-summary-row">
                    <span>${config.totalLabel}</span>
                    <strong>₹${subtotal.toFixed(2)}</strong>
                </div>
                <div class="calculator-summary-row">
                    <span>GST Amount</span>
                    <strong>₹${gstAmount.toFixed(2)}</strong>
                </div>
                <div class="calculator-summary-row calculator-grand-total">
                    <span>Grand Total</span>
                    <strong>₹${grandTotal.toFixed(2)}</strong>
                </div>
            </div>

            <div class="calculator-actions">
                <button type="button" class="secondary-btn" onclick="resetCalculatorPanel()">Reset</button>
            </div>
        </div>
    `;
}

function resetCalculatorPanel() {
    calculatorState.type = "sale";
    calculatorState.name = "";
    calculatorState.quantity = "";
    calculatorState.rate = "";
    calculatorState.gstEnabled = false;
    calculatorState.gstRate = "5";
    calculatorState.saleCustomer = "";
    calculatorState.pisaiCustomer = "";
    calculatorState.purchaseView = "total";
    calculatorState.purchaseDate = "";
    renderCalculatorPanel();
}
