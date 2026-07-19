// =============================================
//  HELPER FUNCTIONS
// =============================================

const API_BASE = 'https://shop-pay-web.onrender.com/api';

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function showMessage(element, text, type = 'info') {
    element.textContent = text;
    element.className = 'message ' + type;
    element.style.display = 'block';
}

function hideMessage(element) {
    element.style.display = 'none';
}

function authHeaders() {
    const token = getToken();
    return { 'Authorization': 'Bearer ' + token };
}

async function apiRequest(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    const response = await fetch(API_BASE + url, {
        ...options,
        headers
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }
    return data;
}

// =============================================
//  AUTH (Register / Login)
// =============================================

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authMessage = document.getElementById('auth-message');
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');

// Switch to Register
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    hideMessage(authMessage);
});

// Switch to Login
document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    hideMessage(authMessage);
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    hideMessage(authMessage);

    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        setToken(data.token);
        setUser(data.user);
        showMessage(authMessage, '✅ Login successful!', 'success');
        setTimeout(() => {
            showDashboard();
        }, 500);
    } catch (err) {
        showMessage(authMessage, '❌ ' + err.message, 'error');
    }
});

// Register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const business_name = document.getElementById('reg-business').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const phone = document.getElementById('reg-phone').value;
    hideMessage(authMessage);

    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ business_name, email, password, phone })
        });
        setToken(data.token);
        setUser(data.user);
        showMessage(authMessage, '✅ Registration successful!', 'success');
        setTimeout(() => {
            showDashboard();
        }, 500);
    } catch (err) {
        showMessage(authMessage, '❌ ' + err.message, 'error');
    }
});

// =============================================
//  DASHBOARD
// =============================================

function showDashboard() {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'flex';
    const user = getUser();
    if (user) {
        document.getElementById('user-name').textContent = user.business_name || user.email;
    }
    loadAccounts();
    loadTransactions();
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    clearSession();
    dashboardSection.style.display = 'none';
    authSection.style.display = 'flex';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    hideMessage(authMessage);
});

// =============================================
//  TABS
// =============================================

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
        document.getElementById('tab-' + tabId).style.display = 'block';
        if (tabId === 'history') loadTransactions();
        if (tabId === 'add-account') loadAccounts();
    });
});

// =============================================
//  ACCOUNTS
// =============================================

document.getElementById('account-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const account_type = document.getElementById('acc-type').value;
    const account_number = document.getElementById('acc-number').value;
    const consumer_key = document.getElementById('acc-key').value;
    const consumer_secret = document.getElementById('acc-secret').value;
    const passkey = document.getElementById('acc-passkey').value || null;
    const resultDiv = document.getElementById('account-result');
    hideMessage(resultDiv);

    try {
        const data = await apiRequest('/accounts', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ account_type, account_number, consumer_key, consumer_secret, passkey, environment: 'sandbox' })
        });
        showMessage(resultDiv, '✅ Account added successfully!', 'success');
        document.getElementById('account-form').reset();
        loadAccounts();
    } catch (err) {
        showMessage(resultDiv, '❌ ' + err.message, 'error');
    }
});

async function loadAccounts() {
    const listDiv = document.getElementById('account-list');
    listDiv.innerHTML = '<p>Loading...</p>';
    try {
        const data = await apiRequest('/accounts', {
            method: 'GET',
            headers: authHeaders()
        });
        if (data.accounts.length === 0) {
            listDiv.innerHTML = '<p>No accounts added yet.</p>';
            return;
        }
        listDiv.innerHTML = '';
        data.accounts.forEach(acc => {
            const item = document.createElement('div');
            item.className = 'account-item';
            item.innerHTML = `
                <div>
                    <strong>${acc.account_type.toUpperCase()}</strong> - ${acc.account_number}
                    <span class="small">(${acc.environment})</span>
                    ${acc.is_default ? ' ⭐' : ''}
                </div>
                <button class="delete-btn" onclick="deleteAccount('${acc.id}')">Delete</button>
            `;
            listDiv.appendChild(item);
        });
    } catch (err) {
        listDiv.innerHTML = '<p class="error">Failed to load accounts.</p>';
    }
}

async function deleteAccount(id) {
    if (!confirm('Delete this account?')) return;
    try {
        await apiRequest('/accounts/' + id, {
            method: 'DELETE',
            headers: authHeaders()
        });
        loadAccounts();
    } catch (err) {
        alert('Failed to delete: ' + err.message);
    }
}
window.deleteAccount = deleteAccount;

// =============================================
//  PAYMENTS - FIXED VERSION
// =============================================

document.getElementById('payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone_number = document.getElementById('pay-phone').value;
    const amount = parseInt(document.getElementById('pay-amount').value);
    const account_reference = document.getElementById('pay-ref').value || 'INV-' + Date.now();
    const resultDiv = document.getElementById('payment-result');
    hideMessage(resultDiv);

    try {
        // 1. Get accounts
        const accounts = await apiRequest('/accounts', {
            method: 'GET',
            headers: authHeaders()
        });

        if (accounts.accounts.length === 0) {
            showMessage(resultDiv, '❌ Please add an M-PESA account first.', 'error');
            return;
        }

        // 2. Use the FIRST account's ID
        const account_id = accounts.accounts[0].id;

        // 3. Send payment request
        const data = await apiRequest('/payment/send', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ account_id, phone_number, amount, account_reference })
        });

        showMessage(resultDiv, `✅ Payment request sent! Transaction ID: ${data.transaction_id}`, 'success');
        loadTransactions();
    } catch (err) {
        showMessage(resultDiv, '❌ ' + err.message, 'error');
    }
});

// =============================================
//  TRANSACTIONS HISTORY
// =============================================

async function loadTransactions() {
    const listDiv = document.getElementById('transaction-list');
    listDiv.innerHTML = '<p>Loading...</p>';
    try {
        listDiv.innerHTML = `
            <p>Transaction history will appear here after you send payments.</p>
            <p><em>Check your server console for callbacks.</em></p>
        `;
    } catch (err) {
        listDiv.innerHTML = '<p>Failed to load history.</p>';
    }
}

// =============================================
//  CHECK AUTH ON LOAD
// =============================================

if (getToken() && getUser()) {
    showDashboard();
} else {
    authSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
}