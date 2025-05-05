let editingId = null;

const purchaseForm = document.getElementById("purchaseForm");
const purchaseModal = document.getElementById("purchaseModal");
const purchaseTableBody = document.querySelector("#salesTable tbody");
const purchaseError = document.getElementById("purchaseErrorMsg");

// Open Modal
function openPurchaseForm(data = null) {
  purchaseModal.classList.add("show");
  if (data) {
    document.getElementById("produceName").value = data.produceName;
    document.getElementById("produceType").value = data.produceType;
    document.getElementById("purchaseDate").value = data.date.split("T")[0];
    document.getElementById("tonnageKgs").value = data.tonnage;
    document.getElementById("costUgx").value = data.cost;
    document.getElementById("dealerName").value = data.dealerName;
    document.getElementById("branchName").value = data.branchName;
    document.getElementById("dealerContact").value = data.contact;
    document.getElementById("sellingPrice").value = data.sellingPrice;
    editingId = data._id;
  } else {
    purchaseForm.reset();
    editingId = null;
  }
}

// Close Modal
function closePurchaseForm() {
  purchaseModal.classList.remove("show");
  purchaseForm.reset();
  purchaseError.textContent = "";
  editingId = null;
}

// Error display
function showPurchaseError(message) {
  purchaseError.textContent = message;
}

// Submit handler
purchaseForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = {
    produceName: document.getElementById("produceName").value.trim(),
    produceType: document.getElementById("produceType").value.trim(),
    date: document.getElementById("purchaseDate").value,
    tonnage: document.getElementById("tonnageKgs").value.trim(),
    cost: document.getElementById("costUgx").value.trim(),
    dealerName: document.getElementById("dealerName").value.trim(),
    branchName: document.getElementById("branchName").value,
    contact: document.getElementById("dealerContact").value.trim(),
    sellingPrice: document.getElementById("sellingPrice").value.trim()
  };

  const phoneRegex = /^\+256\d{9}$/;
  const alphaRegex = /^[a-zA-Z\s]+$/;
  const alphanumRegex = /^[a-zA-Z0-9\s]+$/;

  if (!alphanumRegex.test(formData.produceName)) return showPurchaseError("Produce name must be alphanumeric.");
  if (formData.produceType.length < 2 || !alphaRegex.test(formData.produceType)) return showPurchaseError("Type of produce must be at least 2 characters and alphabetic.");
  if (!formData.date) return showPurchaseError("Date is required.");
  if (formData.tonnage.length < 3 || isNaN(formData.tonnage)) return showPurchaseError("Tonnage must be numeric and at least 3 digits.");
  if (formData.cost.length < 5 || isNaN(formData.cost)) return showPurchaseError("Cost must be numeric and at least 5 digits.");
  if (formData.dealerName.length < 2 || !alphanumRegex.test(formData.dealerName)) return showPurchaseError("Dealer name must be at least 2 characters and alphanumeric.");
  if (!formData.branchName) return showPurchaseError("Branch must be selected.");
  if (!phoneRegex.test(formData.contact)) return showPurchaseError("Invalid contact. Use format +256XXXXXXXXX.");
  if (formData.sellingPrice.length < 1 || isNaN(formData.sellingPrice)) return showPurchaseError("Selling price must be numeric.");

  try {
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/purchase/${editingId}` : "/purchase";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return showPurchaseError("Failed to save purchase: " + errorText);
    }

    loadPurchases();
    closePurchaseForm();
  } catch (err) {
    console.error("Submit error:", err);
    showPurchaseError("Network error submitting purchase.");
  }
});

// Load all purchases
async function loadPurchases() {
  try {
    const res = await fetch("/api/purchase");
    const data = await res.json();
    purchaseTableBody.innerHTML = "";

    data.forEach((purchase) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${purchase.produceName}</td>
        <td>${purchase.produceType}</td>
        <td>${new Date(purchase.date).toLocaleDateString()}</td>
        <td>${purchase.tonnage}</td>
        <td>${purchase.cost}</td>
        <td>${purchase.dealerName}</td>
        <td>${purchase.branchName}</td>
        <td>${purchase.contact}</td>
        <td>${purchase.sellingPrice}</td>
        <td>
          <button class="edit-btn" data-id="${purchase._id}">Edit</button>
          <button class="delete-btn" data-id="${purchase._id}">Delete</button>
        </td>
      `;
      purchaseTableBody.appendChild(row);
    });

    attachActionListeners();
  } catch (err) {
    console.error("Fetch error:", err);
    showPurchaseError("Could not load previous purchases.");
  }
}

// Edit / Delete
function attachActionListeners() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const res = await fetch(`/purchase/${id}`);
      const data = await res.json();
      openPurchaseForm(data);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this purchase?")) {
        const res = await fetch(`/purchase/${id}`, { method: "DELETE" });
        if (res.ok) {
          loadPurchases();
        } else {
          alert("Failed to delete purchase.");
        }
      }
    });
  });
}

function goBack() {
  window.history.back();
}

window.addEventListener("DOMContentLoaded", loadPurchases);
