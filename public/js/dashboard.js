// Initialize stats only if they exist
const userStat = document.getElementById('user-stat');
if (userStat && userStat.querySelector('p')) {
    userStat.querySelector('p').textContent = '120';
}

// Initialize dashboard features only if needed
const dashboardElements = {
    salesText: document.getElementById('salesText'),
    stockText: document.getElementById('stockText'),
    topSalesText: document.getElementById('topSalesText'),
    stockAlertsText: document.getElementById('stockAlertsText'),
    recentActivity: document.getElementById('recentActivity'),
    creditText: document.getElementById('creditText')
};

// Handle logout functionality
document.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.querySelector('[data-feature="logout"]');
    
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                try {
                    const response = await fetch('/logout', {
                        method: 'POST',
                        credentials: 'same-origin'
                    });

                    if (response.ok) {
                        window.location.href = '/';
                    } else {
                        console.error('Logout failed');
                        alert('Logout failed. Please try again.');
                    }
                } catch (error) {
                    console.error('Logout error:', error);
                    alert('An error occurred during logout. Please try again.');
                }
            }
        });
    }
});

async function fetchStockAlerts() {
    if (!dashboardElements.stockAlertsText) return;

    try {
        const response = await fetch('/api/stock-alerts');
        const alerts = await response.json();

        if (alerts.length > 0) {
            const alertText = alerts.map(item => 
                `${item.produceName}: ${item.currentStock}kg remaining`
            ).join('\n');
            dashboardElements.stockAlertsText.innerHTML = alertText;
        } else {
            dashboardElements.stockAlertsText.textContent = 'No low stock alerts';
        }
    } catch (err) {
        console.error('Error fetching stock alerts:', err);
        if (dashboardElements.stockAlertsText) {
            dashboardElements.stockAlertsText.textContent = 'Error loading alerts';
        }
    }
}

async function fetchDashboardStats() {
    try {
        // Show loading state
        Object.values(dashboardElements).forEach(element => {
            if (element) element.innerHTML = 'Loading...';
        });

        const [salesRes, purchasesRes, creditRes] = await Promise.all([
            fetch('/api/dashboard/sales-summary', { credentials: 'same-origin' }),
            fetch('/api/dashboard/stock-summary', { credentials: 'same-origin' }),
            fetch('/api/dashboard/credit-summary', { credentials: 'same-origin' })
        ]);

        // Check for authentication errors
        if (salesRes.status === 401 || purchasesRes.status === 401 || creditRes.status === 401) {
            window.location.href = '/signin';
            return;
        }

        // Check for other errors
        if (!salesRes.ok || !purchasesRes.ok || !creditRes.ok) {
            throw new Error('One or more API requests failed');
        }

        const salesData = await salesRes.json();
        const purchasesData = await purchasesRes.json();
        const creditData = await creditRes.json();

        // Update sales statistics if element exists
        if (dashboardElements.salesText) {
            const totalSales = Object.values(salesData).reduce((sum, branch) => sum + branch.totalAmount, 0);
            const totalQuantity = Object.values(salesData).reduce((sum, branch) => sum + branch.totalTonnage, 0);
            
            const branchBreakdown = Object.entries(salesData)
                .map(([branch, data]) => 
                    `${branch}: UGX ${data.totalAmount.toLocaleString()} (${data.totalTonnage.toFixed(2)} tons)`
                )
                .join('<br>');

            dashboardElements.salesText.innerHTML = `
                <strong>Overall</strong><br>
                Total Sales: UGX ${totalSales.toLocaleString()}<br>
                Total Quantity: ${totalQuantity.toFixed(2)} tons<br>
                <br>
                <strong>By Branch</strong><br>
                ${branchBreakdown || 'No sales data available'}
            `;
        }

        // Update stock statistics if element exists
        if (dashboardElements.stockText && Array.isArray(purchasesData)) {
            const totalStock = purchasesData.reduce((sum, branch) => sum + branch.totalStock, 0);
            const totalValue = purchasesData.reduce((sum, branch) => sum + branch.totalValue, 0);
            
            const stockBreakdown = purchasesData
                .map(item => `${item._id}: ${item.totalStock.toFixed(2)} tons (Value: UGX ${item.totalValue.toLocaleString()})`)
                .join('<br>');

            dashboardElements.stockText.innerHTML = `
                <strong>Overall</strong><br>
                Total Stock: ${totalStock.toFixed(2)} tons<br>
                Stock Value: UGX ${totalValue.toLocaleString()}<br>
                <br>
                <strong>By Branch</strong><br>
                ${stockBreakdown || 'No stock data available'}
            `;
        }

        // Update credit statistics if element exists
        if (dashboardElements.creditText) {
            const totalCredit = Object.values(creditData).reduce((sum, branch) => sum + branch.totalAmount, 0);
            const totalCreditQuantity = Object.values(creditData).reduce((sum, branch) => sum + branch.totalTonnage, 0);
            
            const creditBreakdown = Object.entries(creditData)
                .map(([branch, data]) => 
                    `${branch}: UGX ${data.totalAmount.toLocaleString()} (${data.totalTonnage.toFixed(2)} tons)`
                )
                .join('<br>');

            dashboardElements.creditText.innerHTML = `
                <strong>Overall</strong><br>
                Total Credit: UGX ${totalCredit.toLocaleString()}<br>
                Credit Quantity: ${totalCreditQuantity.toFixed(2)} tons<br>
                <br>
                <strong>By Branch</strong><br>
                ${creditBreakdown || 'No credit data available'}
            `;
        }

        // Update recent activity timestamp
        if (dashboardElements.recentActivity) {
            const now = new Date();
            dashboardElements.recentActivity.innerHTML = `Last updated: ${now.toLocaleString()}`;
        }

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Show error state in UI
        Object.entries(dashboardElements).forEach(([key, element]) => {
            if (element) {
                element.innerHTML = `Error loading ${key.replace('Text', '').toLowerCase()} data. Please try refreshing the page.`;
            }
        });
    }
}

// Initial load
window.addEventListener('DOMContentLoaded', fetchDashboardStats);

// Refresh every 60 seconds
setInterval(fetchDashboardStats, 60000);

// Set up periodic updates only if we have dashboard elements to update
if (Object.values(dashboardElements).some(el => el !== null)) {
    // Initial call
    fetchStockAlerts();

    // Set up periodic updates
    setInterval(fetchStockAlerts, 5 * 60 * 1000); // Every 5 minutes
}
