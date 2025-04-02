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
