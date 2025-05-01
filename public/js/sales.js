// script.js
const recordSaleBtn = document.getElementById("recordSaleBtn");
const saleFormModal = document.getElementById("saleFormModal");
const saleForm = document.getElementById("saleForm");
const cancelBtn = document.getElementById("cancelBtn");
const salesTableBody = document.querySelector("#salesTable tbody");

let editRow = null;

// Show the modal
recordSaleBtn.addEventListener("click", () => {
    saleFormModal.style.display = "flex";
    saleForm.reset();
    editRow = null; // Reset editRow
});

// Hide the modal
cancelBtn.addEventListener("click", () => {
    saleFormModal.style.display = "none";
});

// Handle form submission
saleForm.addEventListener("submit",function(event) {
    event.preventDefault();

    const produceName = document.getElementById("produceName").value;
    const tonnage = document.getElementById("tonnage").value;
    const amount = document.getElementById("amount").value;
    const buyerName = document.getElementById("buyerName").value;
    const dateTime = document.getElementById("dateTime").value;
    const agentName = document.getElementById("agentName").value;
    const branchName = document.getElementById("branchName").value;

    if (!produceName || !tonnage || !amount || !buyerName || !dateTime || !agentName) {
        alert("All fields are required!");
        return;
    }

    if (editRow) {
        // Update existing row
        editRow.innerHTML = `
            <td>${produceName}</td>
            <td>${tonnage}</td>
            <td>${amount}</td>
            <td>${buyerName}</td>
            <td>${dateTime}</td>
            <td>${agentName}</td>
            <td>${branchName}</td>
            <td><button class="editBtn">Edit</button></td>
        `;
        attachEditListeners();
    } else {
        // Add a new row
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${produceName}</td>
            <td>${tonnage}</td>
            <td>${amount}</td>
            <td>${buyerName}</td>
            <td>${dateTime}</td>
            <td>${agentName}</td>
            <td>${branchName}</td>
            <td><button class="editBtn">Edit</button></td>
        `;
        salesTableBody.insertBefore(row, salesTableBody.firstChild); // Add row to the top
attachEditListeners();

    }

    saleFormModal.style.display = "none";
});

// Attach edit button listeners
function attachEditListeners() {
    document.querySelectorAll(".editBtn").forEach((button) => {
        button.addEventListener("click", (e) => {
            const row = e.target.closest("tr");
            editRow = row;

            const cells = row.querySelectorAll("td");
            document.getElementById("produceName").value = cells[0].textContent;
            document.getElementById("tonnage").value = cells[1].textContent;
            document.getElementById("amount").value = cells[2].textContent;
            document.getElementById("buyerName").value = cells[3].textContent;
            document.getElementById("dateTime").value = cells[4].textContent;
            document.getElementById("agentName").value = cells[5].textContent;
            document.getElementById("branchName").value = cells[6].textContent;

            saleFormModal.style.display = "flex";
        });
    });
}
function goBack() {
    window.history.back();
}

// Initial listener attachment
attachEditListeners();