document.getElementById('user-stat').querySelector('p').textContent = '120';

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
  }

  const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');

// Example content for features
const featureContent = {
   
    users: `
        <h2>Users</h2>
        <button>Add User</button>
        <ul>
            <li>Winnie (Admin)</li>
            <li>John (Sales Agent)</li>
        </ul>
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