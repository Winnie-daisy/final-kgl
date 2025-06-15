let editingId = null;

const creditForm = document.getElementById("creditForm");
const creditModal = document.getElementById("creditModal");
const creditTableBody = document.querySelector("#creditTable tbody");
const creditError = document.getElementById("creditErrorMsg");

// Open modal with or without data
function openCreditForm(data = null) {
  creditModal.classList.add("show");
  if (data) {
    document.getElementById("buyerName").value = data.buyerName;
    document.getElementById("nationalId").value = data.nationalId;
    document.getElementById("location").value = data.location;
    document.getElementById("contact").value = data.contact;
    document.getElementById("amountDue").value = data.amountDue;
    document.getElementById("saleAgent").value = data.saleAgent;
    document.getElementById("dueDate").value = data.dueDate.split("T")[0];
    document.getElementById("produceName").value = data.produceName;
    document.getElementById("branch").value = data.branchName;
    document.getElementById("tonnage").value = data.tonnage;
    document.getElementById("dispatchDate").value = data.dispatchDate.split("T")[0];
    editingId = data._id;
  } else {
    creditForm.reset();
    editingId = null;
  }
  creditError.textContent = ""; // Clear any previous errors
}

// Close modal
function closeCreditForm() {
  creditModal.classList.remove("show");
  creditForm.reset();
  creditError.textContent = "";
  editingId = null;
}

// Display form error
function showCreditError(message) {
  creditError.textContent = message;
  creditError.style.color = 'red';
  creditError.style.padding = '10px';
  creditError.style.marginTop = '10px';
}

// Submit form handler
creditForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = {
    buyerName: document.getElementById("buyerName").value.trim(),
    nationalId: document.getElementById("nationalId").value.trim(),
    location: document.getElementById("location").value.trim(),
    contact: document.getElementById("contact").value.trim(),
    amountDue: document.getElementById("amountDue").value.trim(),
    saleAgent: document.getElementById("saleAgent").value.trim(),
    dueDate: document.getElementById("dueDate").value,
    produceName: document.getElementById("produceName").value.trim(),
    branchName: document.getElementById("branchName").value.trim(),
    tonnage: parseFloat(document.getElementById("tonnage").value.trim()),
    dispatchDate: document.getElementById("dispatchDate").value
  };

  const phoneRegex = /^\+256\d{9}$/;
  const ninRegex = /^[A-Z]{2}\d{8}[A-Z]{4}$/;
  const nameRegex = /^[a-z0-9\s]+$/i;

  // Client-side validation
  if (formData.buyerName.length < 2 || !nameRegex.test(formData.buyerName)) return showCreditError("Invalid buyer name.");
  if (!ninRegex.test(formData.nationalId)) return showCreditError("Invalid National ID format.");
  if (formData.location.length < 2 || !nameRegex.test(formData.location)) return showCreditError("Invalid location.");
  if (!phoneRegex.test(formData.contact)) return showCreditError("Invalid contact. Use +256XXXXXXXXX.");
  if (formData.amountDue < 1000) return showCreditError("Amount due must be at least 1000 UGX.");
  if (formData.saleAgent.length < 2 || !nameRegex.test(formData.saleAgent)) return showCreditError("Invalid sales agent name.");
  if (formData.produceName.length < 2 || !nameRegex.test(formData.produceName)) return showCreditError("Invalid produce name.");
  if (isNaN(formData.tonnage) || formData.tonnage <= 0) return showCreditError("Tonnage must be a positive number.");

  try {
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/credit/${editingId}` : "/credit";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Handle specific stock-related errors
      if (errorText.includes("Insufficient stock") || errorText.includes("Product not found")) {
        showCreditError(errorText);
      } else {
        showCreditError("Failed to save credit sale: " + errorText);
      }
      return;
    }

    await loadCredits();
    closeCreditForm();
  } catch (err) {
    console.error("Submit error:", err);
    showCreditError("Network error submitting credit sale.");
  }
});

// Load all credits
async function loadCredits() {
  try {
    const res = await fetch("/api/credit");
    const data = await res.json();
    creditTableBody.innerHTML = "";

    data.forEach((credit) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${credit.buyerName}</td>
        <td>${credit.nationalId}</td>
        <td>${credit.location}</td>
        <td>${credit.contact}</td>
        <td>${credit.amountDue}</td>
        <td>${credit.saleAgent}</td>
        <td>${new Date(credit.dueDate).toLocaleDateString()}</td>
        <td>${credit.produceName}</td>
        <td>${credit.branchName}</td>
        <td>${credit.tonnage}</td>
        <td>${new Date(credit.dispatchDate).toLocaleDateString()}</td>
        <td>
          <button class="edit-btn" data-id="${credit._id}">Edit</button>
          <button class="delete-btn" data-id="${credit._id}">Delete</button>
        </td>
      `;
      creditTableBody.appendChild(row);
    });

    attachActionListeners();
  } catch (err) {
    console.error("Fetch error:", err);
    showCreditError("Could not load previous credit records.");
  }
}

// Attach handlers for edit/delete
function attachActionListeners() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const res = await fetch(`/credit/${id}`);
      const data = await res.json();
      openCreditForm(data);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this credit record?")) {
        const res = await fetch(`/credit/${id}`, { method: "DELETE" });
        if (res.ok) {
          loadCredits();
        } else {
          alert("Failed to delete credit.");
        }
      }
    });
  });
}

function goBack() {
  window.history.back();
}

window.addEventListener("DOMContentLoaded", loadCredits);

// Open form when record button clicked
document.getElementById("recordCreditBtn").addEventListener("click", () => {
  openCreditForm();
});
