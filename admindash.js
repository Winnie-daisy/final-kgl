document.getElementById('user-stat').querySelector('p').textContent = '120';

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
  }

  const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');

// Example content for features
const featureContent = {
    produces: `
        <h2>Products</h2>
        <table>
            <tr><th>Product</th><th>Price</th><th>Update</th></tr>
            <tr><td>Apple</td><td>$1</td><td><button>Update</button></td></tr>
            <tr><td>Banana</td><td>$0.5</td><td><button>Update</button></td></tr>
        </table>
        <button>Add Product</button>
    `,
    sales: `
        <h2>Record and View Sales</h2>
        <form>
            <input type="text" placeholder="Product Name">
            <input type="number" placeholder="Quantity Sold">
            <input type="number" placeholder="Price">
            <button>Record Sale</button>
        </form>
        <h3>Sales History</h3>
        <ul>
            <li>Apple: 50 units sold</li>
            <li>Banana: 30 units sold</li>
        </ul>
    `,
    purchases: `
        <h2>Manage Purchases</h2>
        <p>Add your purchase details here...</p>
        <form>
            <input type="text" placeholder="Product Name">
            <input type="number" placeholder="Quantity Purchased">
            <input type="number" placeholder="Price">
            <button>Record Purchase</button>
        </form>
    `,
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
            <button>Save Changes</button>
        </form>
    `,
    logout: `
        <h2>Are you sure you want to logout?</h2>
        <button>Logout</button>
    `
};

// Listen for navigation clicks
sidebar.addEventListener('click', (event) => {
    const feature = event.target.getAttribute('data-feature');
    if (feature && featureContent[feature]) {
        content.innerHTML = featureContent[feature];
    }
});