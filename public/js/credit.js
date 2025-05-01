const form = document.getElementById("creditSaleForm");
const tableBody = document.querySelector("#salesTable tbody");
const errorMsg = document.getElementById("errorMsg");

function openForm() {
  document.getElementById("salesForm").style.display = "block";
}

function closeForm() {
  document.getElementById("salesForm").style.display = "none";
  form.reset();
  errorMsg.textContent = "";
}

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const buyerName = form.buyerName.value.trim();
  const nationalId = form.nationalId.value.trim();
  const location = form.location.value.trim();
  const contacts = form.contacts.value.trim();
  const amountDue = form.amountDue.value.trim();
  const salesAgent = form.salesAgent.value.trim();
  const dueDate = form.dueDate.value;
  const produceName = form.produceName.value.trim();
  const produceType = form.produceType.value.trim();
  const tonnage = form.tonnage.value.trim();
  const dispatchDate = form.dispatchDate.value;

  // Validation
  const phoneRegex = /^\+256\d{9}$/;
  const ninRegex = /^[A-Z]{2}\d{13}[A-Z]{1}$/i;

  if (buyerName.length < 2 || !/^[a-z0-9\s]+$/i.test(buyerName)) {
    return showError("Invalid buyer name.");
  }

  if (!ninRegex.test(nationalId)) {
    return showError("Invalid National ID format.");
  }

  if (location.length < 2 || !/^[a-z0-9\s]+$/i.test(location)) {
    return showError("Invalid location.");
  }

  if (!phoneRegex.test(contacts)) {
    return showError("Invalid contact format. Use +256XXXXXXXXX.");
  }

  if (amountDue.length < 5 || isNaN(amountDue)) {
    return showError("Amount due should be a number with at least 5 digits.");
  }

  if (salesAgent.length < 2 || !/^[a-z0-9\s]+$/i.test(salesAgent)) {
    return showError("Invalid sales agent name.");
  }

  if (produceName.length < 2 || !/^[a-z0-9\s]+$/i.test(produceName)) {
    return showError("Invalid produce name.");
  }

  // Add row to top of table
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td>${buyerName}</td>
    <td>${nationalId}</td>
    <td>${location}</td>
    <td>${contacts}</td>
    <td>${amountDue}</td>
    <td>${salesAgent}</td>
    <td>${dueDate}</td>
    <td>${produceName}</td>
    <td>${produceType}</td>
    <td>${tonnage}</td>
    <td>${dispatchDate}</td>
  `;
  tableBody.insertBefore(newRow, tableBody.firstChild);

  closeForm();
});

function showError(message) {
  errorMsg.textContent = message;
}

function goBack() {
  window.history.back();
}