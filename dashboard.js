// Sample data for demonstration
const branches = [
    { branch: "Maganjjo Branch", sales: 12000, topProducts: ["Beans", "Maize"] },
    { branch: "Mattuga Branch", sales: 15500, topProducts: ["Gnuts", "Soybeans"] },
  ];
  
  const users = ["Alice - Manager", "Orban - Director", "Charlie - Sales Agent"];
  
  // Populate sales table
  function populateSalesTable() {
    const salesTable = document.getElementById("salesTable");
    branches.forEach(branch => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${branch.branch}</td>
        <td>${branch.sales}</td>
        <td>${branch.topProducts.join(", ")}</td>
      `;
      salesTable.appendChild(row);
    });
  }
  
  // Populate user list
  function populateUserList() {
    const userList = document.getElementById("userList");
    users.forEach(user => {
      const listItem = document.createElement("li");
      listItem.textContent = user;
      userList.appendChild(listItem);
    });
  }
  
  // Update stock and price
  function updateStock() {
    const itemName = document.getElementById("itemName").value;
    const itemPrice = document.getElementById("itemPrice").value;
    const itemStock = document.getElementById("itemStock").value;
    alert(`Updated ${itemName} with Price: $${itemPrice} and Stock: ${itemStock}`);
  }
  
  // Add purchase
  function addPurchase() {
    const purchaseItem = document.getElementById("purchaseItem").value;
    const purchaseQuantity = document.getElementById("purchaseQuantity").value;
    const branch = document.getElementById("branch").value;
    alert(`Added ${purchaseQuantity} of ${purchaseItem} to ${branch}`);
  }
  
  // Save account settings
  function saveAccountSettings() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    alert(`Account updated with Username: ${username}`);
  }
  
  // Initialize data
  document.addEventListener("DOMContentLoaded", () => {
    populateSalesTable();
    populateUserList();
  });