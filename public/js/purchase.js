// Handle modal open/close
function openPurchaseForm() {
    const purchaseModal = document.getElementById("purchaseModal");
    const purchaseForm = document.getElementById("purchaseForm");
    if (purchaseModal && purchaseForm) {
        purchaseForm.reset();
        purchaseModal.style.display = "block";
    }
}

function closePurchaseForm() {
    const purchaseModal = document.getElementById("purchaseModal");
    if (purchaseModal) {
        purchaseModal.style.display = "none";
    }
}

function goBack() {
    window.history.back();
}

// Load and handle purchases
document.addEventListener('DOMContentLoaded', () => {
    const purchaseForm = document.getElementById("purchaseForm");
    const purchaseErrorMsg = document.getElementById("purchaseErrorMsg");

    // Load existing purchases when page loads
    loadPurchases();

    if (purchaseForm) {
        purchaseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            purchaseErrorMsg.textContent = '';
            
            const formData = new FormData(purchaseForm);
            const purchaseData = Object.fromEntries(formData.entries());

            // Convert numeric fields to numbers
            purchaseData.tonnage = parseFloat(purchaseData.tonnage);
            purchaseData.cost = parseFloat(purchaseData.cost);
            purchaseData.sellingPrice = parseFloat(purchaseData.sellingPrice);

            try {
                const response = await fetch('/api/purchase', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(purchaseData)
                });

                if (response.ok) {
                    const result = await response.json();
                    closePurchaseForm();
                    loadPurchases();
                    purchaseForm.reset();
                } else {
                    const error = await response.json();
                    purchaseErrorMsg.textContent = error.error || 'Failed to record purchase';
                }
            } catch (error) {
                console.error('Error:', error);
                purchaseErrorMsg.textContent = 'An error occurred while saving the purchase';
            }
        });
    }
});

async function loadPurchases() {
    const purchaseTable = document.getElementById("purchaseTable").getElementsByTagName('tbody')[0];
    try {
        const response = await fetch('/api/purchase');
        const purchases = await response.json();
        
        purchaseTable.innerHTML = ''; // Clear existing rows
        
        purchases.forEach(purchase => {
            const row = purchaseTable.insertRow();
            row.innerHTML = `
                <td>${purchase.produceName}</td>
                <td>${purchase.produceType}</td>
                <td>${new Date(purchase.date).toLocaleDateString()}</td>
                <td>${purchase.tonnage}</td>
                <td>${purchase.cost}</td>
                <td>${purchase.dealerName}</td>
                <td>${purchase.branch}</td>
                <td>${purchase.contact}</td>
                <td>${purchase.sellingPrice}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editPurchase('${purchase._id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deletePurchase('${purchase._id}')">Delete</button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading purchases:', error);
    }
}

async function deletePurchase(id) {
    if (confirm('Are you sure you want to delete this purchase?')) {
        try {
            const response = await fetch(`/api/purchase/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadPurchases(); // Refresh the table
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete purchase');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while deleting the purchase');
        }
    }
}

async function editPurchase(id) {
    try {
        const response = await fetch(`/api/purchase/${id}`);
        if (response.ok) {
            const purchase = await response.json();
            
            // Populate form with existing data
            document.getElementById('produceName').value = purchase.produceName;
            document.getElementById('produceType').value = purchase.produceType;
            document.getElementById('purchaseDate').value = purchase.date.split('T')[0];
            document.getElementById('tonnageKgs').value = purchase.tonnage;
            document.getElementById('costUgx').value = purchase.cost;
            document.getElementById('dealerName').value = purchase.dealerName;
            document.getElementById('branch').value = purchase.branch;
            document.getElementById('dealerContact').value = purchase.contact;
            document.getElementById('sellingPrice').value = purchase.sellingPrice;
            
            // Show the form
            openPurchaseForm();
            
            // Update form submit handler for edit
            const form = document.getElementById('purchaseForm');
            form.onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const updatedData = Object.fromEntries(formData.entries());
                
                try {
                    const updateResponse = await fetch(`/api/purchase/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedData)
                    });
                    
                    if (updateResponse.ok) {
                        closePurchaseForm();
                        loadPurchases();
                        // Reset form to normal submit behavior
                        form.onsubmit = null;
                    } else {
                        const error = await updateResponse.json();
                        document.getElementById('purchaseErrorMsg').textContent = 
                            error.error || 'Failed to update purchase';
                    }
                } catch (error) {
                    console.error('Error:', error);
                    document.getElementById('purchaseErrorMsg').textContent = 
                        'An error occurred while updating the purchase';
                }
            };
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading purchase details');
    }
}
