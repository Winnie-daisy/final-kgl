let editingId = null;

const creditForm = document.getElementById("creditForm");
const creditModal = document.getElementById("creditModal");
const creditTableBody = document.querySelector("#salesTable tbody");
const creditError = document.getElementById("creditErrorMsg");

// Open Modal
function openCreditForm(data = null) {
  creditModal.classList.add("show");

  if (data) {
    document.getElementById("buyerName").value = data.buyerName;
    document.getElementById("nationalId").value = data.nationalId;
    document.getElementById("location").value = data.location;
    document.getElementById("contact").value = data.contact;
    document.getElementById("amountDue").value = data.amountDue;
    document.getElementById("saleAgent").value = data.saleAgent;
    document.getElementById("dueDate").value = data.dueDate;
    document.getElementById("produceName").value = data.produceName;
    document.getElementById("produceType").value = data.produceType;
    document.getElementById("tonnage").value = data.tonnage;
    document.getElementById("dispatchDate").value = data.dispatchDate;
    editingId = data._id;
  } else {
    creditForm.reset();
    editingId = null;
  }
}

// Close Modal
function closeCreditForm() {
  creditModal.classList.remove("show");
  creditForm.reset();
  creditError.textContent = "";
  editingId = null;
}

// Display error messages
function showCreditError(message) {
  creditError.textContent = message;
}

// Submit handler
creditForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const buyerName = document.getElementById("buyerName").value.trim();
  const nationalId = document.getElementById("nationalId").value.trim();
  const location = document.getElementById("location").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const amountDue = document.getElementById("amountDue").value.trim();
  const saleAgent = document.getElementById("saleAgent").value.trim();
  const dueDate = document.getElementById("dueDate").value;
  const produceName = document.getElementById("produceName").value.trim();
  const produceType = document.getElementById("produceType").value.trim();
  const tonnage = document.getElementById("tonnage").value.trim();
  const dispatchDate = document.getElementById("dispatchDate").value.trim();

  const phoneRegex = /^\+256\d{9}$/;
  const ninRegex = /^[A-Z]{2}\d{8}[A-Z]{4}$/;


  if (buyerName.length < 2 || !/^[a-z0-9\s]+$/i.test(buyerName)) {
    return showCreditError("Invalid buyer name.");
  }
  if (!ninRegex.test(nationalId)) {
    return showCreditError("Invalid National ID format.");
  }
  if (location.length < 2 || !/^[a-z0-9\s]+$/i.test(location)) {
    return showCreditError("Invalid location.");
  }
  if (!phoneRegex.test(contact)) {
    return showCreditError("Invalid contact format. Use +256XXXXXXXXX.");
  }
  if (amountDue.length < 5 || isNaN(amountDue)) {
    return showCreditError("Amount due should be a number with at least 5 digits.");
  }
  if (saleAgent.length < 2 || !/^[a-z0-9\s]+$/i.test(saleAgent)) {
    return showCreditError("Invalid sales agent name.");
  }
  if (produceName.length < 2 || !/^[a-z0-9\s]+$/i.test(produceName)) {
    return showCreditError("Invalid produce name.");
  }

  const formData = {
    buyerName,
    nationalId,
    location,
    contact,
    amountDue,
    saleAgent,
    dueDate,
    produceName,
    produceType,
    tonnage,
    dispatchDate
  };

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
      return showCreditError("Failed to save credit: " + errorText);
    }

    loadCredits();
    closeCreditForm();
  } catch (err) {
    console.error("Submit error:", err);
    showCreditError("Network error submitting credit.");
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
        <td>${credit.dueDate}</td>
        <td>${credit.produceName}</td>
        <td>${credit.produceType}</td>
        <td>${credit.tonnage}</td>
        <td>${credit.dispatchDate}</td>
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
    showCreditError("Could not load previous credit.");
  }
}

// Attach Edit and Delete button handlers
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
      if (confirm("Are you sure you want to delete this credit?")) {
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

// Go back
function goBack() {
  window.history.back();
}

// Load data on page ready
window.addEventListener("DOMContentLoaded", loadCredits);

// Attach button listener to open form
document.getElementById("recordCreditBtn").addEventListener("click", () => {
  openCreditForm();
});
