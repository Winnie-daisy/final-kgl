let editingId = null;

const recordSaleBtn = document.getElementById("recordSaleBtn");
const saleFormModal = document.getElementById("saleFormModal");
const saleForm = document.getElementById("saleForm");
const cancelBtn = document.getElementById("cancelBtn");
const salesTableBody = document.querySelector("#salesTable tbody");

recordSaleBtn.addEventListener("click", () => {
  editingId = null;
  saleFormModal.style.display = "flex";
  saleForm.reset();
});

cancelBtn.addEventListener("click", () => {
  saleFormModal.style.display = "none";
});

saleForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = {
    produceName: document.getElementById("produceName").value,
    tonnage: document.getElementById("tonnage").value,
    amount: document.getElementById("amount").value,
    buyerName: document.getElementById("buyerName").value,
    agentName: document.getElementById("agentName").value,
    branchName: document.getElementById("branchName").value,
  };

  const allFilled = Object.values(formData).every((val) => val.trim() !== "");
  if (!allFilled) {
    alert("All fields are required!");
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

    if (response.ok) {
      saleFormModal.style.display = "none";
      await loadSales(); // Refresh list
    } else {
      const errorText = await response.text();
      alert("Failed to save: " + errorText);
    }
  } catch (err) {
    console.error("Error submitting sale:", err);
    alert("Something went wrong");
  }
});

async function loadSales() {
  try {
    const response = await fetch("/api/sales");
    const sales = await response.json();

    salesTableBody.innerHTML = ""; // Clear the table

    sales.forEach((sale) => {
      const row = document.createElement("tr");
      row.setAttribute("data-id", sale._id);
      row.innerHTML = `
        <td>${sale.produceName}</td>
        <td>${sale.tonnage}</td>
        <td>${sale.amount}</td>
        <td>${sale.buyerName}</td>
        <td>${new Date(sale.dateTime).toLocaleString()}</td>
        <td>${sale.agentName}</td>
        <td>${sale.branchName}</td>
        <td>
          <button class="editBtn">Edit</button>
          <button class="deleteBtn">Delete</button>
        </td>
      `;
      salesTableBody.appendChild(row);
    });

    attachEditListeners();
    attachDeleteListeners();
  } catch (error) {
    console.error("Error loading sales:", error);
  }
}

function attachEditListeners() {
  const editButtons = document.querySelectorAll(".editBtn");
  editButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      editingId = row.getAttribute("data-id");
      const cells = row.querySelectorAll("td");

      document.getElementById("produceName").value = cells[0].textContent;
      document.getElementById("tonnage").value = cells[1].textContent;
      document.getElementById("amount").value = cells[2].textContent;
      document.getElementById("buyerName").value = cells[3].textContent;
      document.getElementById("agentName").value = cells[5].textContent;
      document.getElementById("branchName").value = cells[6].textContent;

      saleFormModal.style.display = "flex";
    });
  });
}

function attachDeleteListeners() {
  const deleteButtons = document.querySelectorAll(".deleteBtn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      const row = e.target.closest("tr");
      const id = row.getAttribute("data-id");

      if (confirm("Are you sure you want to delete this sale?")) {
        try {
          const response = await fetch(`/sales/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            row.remove();
          } else {
            alert("Failed to delete sale");
          }
        } catch (error) {
          console.error("Delete error:", error);
          alert("Something went wrong");
        }
      }
    });
  });
}

function goBack() {
  window.history.back();
}

loadSales(); // Initial call
