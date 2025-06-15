let editingId = null;

const recordSaleBtn = document.getElementById("recordSaleBtn");
const saleFormModal = document.getElementById("saleFormModal");
const saleForm = document.getElementById("saleForm");
const cancelBtn = document.getElementById("cancelBtn");
const salesTableBody = document.querySelector("#salesTable tbody");

// Function to check stock levels
async function checkStock(produceName, branch) {
  try {
    const response = await fetch(`/api/check-stock/${encodeURIComponent(produceName)}/${encodeURIComponent(branch)}`);
    const data = await response.json();
    const stockInfo = document.getElementById("stockInfo");
    
    if (response.ok) {
      stockInfo.textContent = `Available stock: ${data.currentStock}kg`;
      stockInfo.style.backgroundColor = data.isLow ? "#fff3cd" : "#d4edda";
      stockInfo.style.color = data.isLow ? "#856404" : "#155724";
      
      if (data.isLow) {
        stockInfo.textContent += " (Low stock!)";
      }
    } else {
      stockInfo.textContent = data.error || "Error checking stock";
      stockInfo.style.backgroundColor = "#f8d7da";
      stockInfo.style.color = "#721c24";
    }
  } catch (err) {
    console.error("Error checking stock:", err);
    stockInfo.textContent = "Error checking stock";
    stockInfo.style.backgroundColor = "#f8d7da";
    stockInfo.style.color = "#721c24";
  }
}

// Modal open/close handlers
recordSaleBtn.addEventListener("click", () => {
  editingId = null;
  saleForm.reset();
  document.getElementById("stockInfo").textContent = "";
  saleFormModal.style.display = "flex";
});

cancelBtn.addEventListener("click", () => {
  saleFormModal.style.display = "none";
  saleForm.reset();
  editingId = null;
});

// Event listeners for stock checking
document.getElementById("produceName").addEventListener("change", (e) => {
  const produceName = e.target.value;
  const branch = document.getElementById("branch").value;
  if (produceName && branch) {
    checkStock(produceName, branch);
  }
});

document.getElementById("branch").addEventListener("change", (e) => {
  const branch = e.target.value;
  const produceName = document.getElementById("produceName").value;
  if (produceName && branch) {
    checkStock(produceName, branch);
  }
});

// Form submission handler
saleForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Clear previous error messages
  document.querySelectorAll(".error-message").forEach(el => el.classList.remove("show"));

  const formData = {
    produceName: document.getElementById("produceName").value.trim(),
    tonnage: parseFloat(document.getElementById("tonnage").value),
    amountPaid: parseFloat(document.getElementById("amountPaid").value),
    buyerName: document.getElementById("buyerName").value.trim(),
    agentName: document.getElementById("agentName").value.trim(),
    branch: document.getElementById("branch").value
  };

  // Validate form data
  if (!formData.produceName || isNaN(formData.tonnage) || isNaN(formData.amountPaid) || 
      !formData.buyerName || !formData.agentName || !formData.branch) {
    if (isNaN(formData.tonnage)) {
      document.getElementById("tonnageError").classList.add("show");
    }
    if (isNaN(formData.amountPaid)) {
      document.getElementById("amountError").classList.add("show");
    }
    return;
  }

  try {
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/sales/${editingId}` : "/sales";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      alert("Failed to save: " + errorText);
      return;
    }

    saleFormModal.style.display = "none";
    editingId = null;
    saleForm.reset();
    await loadSales();
  } catch (err) {
    console.error("Error submitting sale:", err);
    alert("Something went wrong");
  }
});

// Load and display sales
async function loadSales() {
  try {
    const response = await fetch("/api/sales");
    const sales = await response.json();

    salesTableBody.innerHTML = "";

    sales.forEach((sale) => {
      const row = document.createElement("tr");
      row.setAttribute("data-id", sale._id);
      row.innerHTML = `
        <td>${sale.produceName}</td>
        <td>${sale.tonnage}</td>
        <td>${sale.amountPaid.toLocaleString()} UGX</td>
        <td>${sale.buyerName}</td>
        <td>${new Date(sale.dateTime).toLocaleString()}</td>
        <td>${sale.agentName}</td>
        <td>${sale.branch}</td>
        <td>
          <button class="editBtn" onclick="handleEdit('${sale._id}')">Edit</button>
          <button class="deleteBtn" onclick="handleDelete('${sale._id}')">Delete</button>
        </td>
      `;
      salesTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading sales:", error);
    alert("Error loading sales");
  }
}

// Edit handler
window.handleEdit = async function(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  editingId = id;
  const cells = row.querySelectorAll("td");

  document.getElementById("produceName").value = cells[0].textContent;
  document.getElementById("tonnage").value = cells[1].textContent;
  document.getElementById("amountPaid").value = cells[2].textContent.replace(/[^\d.-]/g, "");
  document.getElementById("buyerName").value = cells[3].textContent;
  document.getElementById("agentName").value = cells[5].textContent;
  document.getElementById("branch").value = cells[6].textContent;

  saleFormModal.style.display = "flex";
  checkStock(cells[0].textContent, cells[6].textContent);
};

// Delete handler
window.handleDelete = async function(id) {
  if (!confirm("Are you sure you want to delete this sale?")) return;

  try {
    const response = await fetch(`/sales/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete sale");
    }

    await loadSales();
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to delete sale");
  }
};

function goBack() {
  window.history.back();
}

// Initial load
loadSales();
