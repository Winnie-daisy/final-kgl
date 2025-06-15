console.log('Dashboard script loading...');

// Show loading indicator for stats
document.getElementById('salesText').textContent = 'Loading...';
document.getElementById('stockText').textContent = 'Loading...';
document.getElementById('topSalesText').textContent = 'Loading...';
document.getElementById('user-stat').querySelector('p').textContent = 'Loading...';

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
                        window.location.href = '/'; // Redirect to index page
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

async function fetchDashboardStats() {
  console.log('Fetching dashboard stats...');
  try {
    const [salesRes, stockRes, topSalesRes] = await Promise.all([
      fetch("/api/dashboard/sales-summary"),
      fetch("/api/dashboard/stock-summary"),
      fetch("/api/dashboard/top-sales"),
    ]);

    console.log('Sales response:', await salesRes.clone().text());
    console.log('Stock response:', await stockRes.clone().text());
    console.log('Top sales response:', await topSalesRes.clone().text());

    const salesData = await salesRes.json();
    const stockData = await stockRes.json();
    const topSalesData = await topSalesRes.json();

    console.log('Processed data:', { salesData, stockData, topSalesData });

    // Format sales summary
    const salesSummary = Object.entries(salesData)
      .map(([branch, data]) => {
        return `${branch}: UGX ${data.totalAmount.toLocaleString()} (${data.totalTonnage.toFixed(2)} tons)`;
      })
      .join('<br>');
    document.getElementById("salesText").innerHTML = salesSummary || "No sales data";

    // Format stock summary
    const stockSummary = stockData
      .map(item => {
        return `${item._id}: ${item.totalStock.toFixed(2)} tons (Value: UGX ${item.totalValue.toLocaleString()})`;
      })
      .join('<br>');
    document.getElementById("stockText").innerHTML = stockSummary || "No stock data";

    // Format top sales
    const topSalesSummary = topSalesData
      .map(item => {
        const product = item.topProduct;
        return `${item._id}: ${product.name} (${product.tonnage.toFixed(2)} tons - UGX ${product.amount.toLocaleString()})`;
      })
      .join('<br>');
    document.getElementById("topSalesText").innerHTML = topSalesSummary || "No top sales data";

  } catch (err) {
    console.error("Dashboard stats fetch error:", err);
    document.getElementById("salesText").textContent = "Error loading sales data";
    document.getElementById("stockText").textContent = "Error loading stock data";
    document.getElementById("topSalesText").textContent = "Error loading top sales data";
  }
}

// Sidebar Feature Toggling
const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');

const featureContent = {
  users: `
    <h2>Users</h2>
    <button>Add User</button>
    <ul>
      <li>Winnie (Admin)</li>
      <li>John (Sales Agent)</li>
    </ul>
  `,
  settings: `
    <h2>Account Settings</h2>
    <form>
      <label>Username: <input type="text" value="Winnie"></label>
      <label>Password: <input type="password" value="******"></label>
      <button type="submit">Save Changes</button>
    </form>
  `,
  logout: `
    <h2>Are you sure you want to logout?</h2>
    <form id="logout-form" action="/logout" method="POST">
      <button type="submit">Logout</button>
    </form>
  `
};

// Handle sidebar clicks
sidebar.addEventListener('click', (event) => {
  const feature = event.target.getAttribute('data-feature');
  if (feature && featureContent[feature]) {
    content.innerHTML = featureContent[feature];

    if (feature === 'logout') {
      const logoutForm = document.getElementById('logout-form');
      if (logoutForm) {
        logoutForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          try {
            const res = await fetch('/logout', {
              method: 'POST',
              credentials: 'same-origin',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            });

            if (res.redirected) {
              window.location.href = res.url;
            } else {
              console.error('Logout failed or not redirected');
            }
          } catch (err) {
            console.error('Logout error:', err);
          }
        });
      }
    }
  }
});

// Auto-refresh dashboard stats every 60 seconds
setInterval(fetchDashboardStats, 60000);

// Initial load
console.log('Setting up initial load...');
window.addEventListener("DOMContentLoaded", () => {
  console.log('DOM Content Loaded, fetching stats...');
  fetchDashboardStats();
});
