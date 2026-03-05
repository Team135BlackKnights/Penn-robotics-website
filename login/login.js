const isLocal = window.location.hostname === '127.0.0.1' && window.location.port === '5500';
const baseUrl = isLocal ? 'http://127.0.0.1:5000' : 'https://api.pennrobotics.org';

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Accepted") {
            window.location.href = "admin.html";
        } else {
            alert("Invalid credentials");
        }
    })
    .catch(error => console.error('Error:', error));
});

// Show / hide password toggle
(function () {
    var pwd = document.getElementById('password');
    var toggle = document.getElementById('show-pass');
    if (!pwd || !toggle) return;

    function setIcon(shown) {
        toggle.setAttribute('aria-pressed', shown ? 'true' : 'false');
        // simple eye / eye-slash icons: keep markup small
        if (shown) {
            toggle.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M2.5 2.5l19 19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"></path><path d="M1 12s4-7 11-7c2.2 0 4.3.5 6.1 1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"></path><path d="M21 12s-4 7-11 7c-2.2 0-4.3-.5-6.1-1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg>';
        } else {
            toggle.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>';
        }
    }

    // init
    setIcon(false);

    toggle.addEventListener('click', function (e) {
        e.preventDefault();
        var isShown = pwd.type === 'text';
        if (isShown) {
            pwd.type = 'password';
            setIcon(false);
        } else {
            pwd.type = 'text';
            setIcon(true);
        }
        // keep focus on input after toggle
        pwd.focus();
    });
})();
