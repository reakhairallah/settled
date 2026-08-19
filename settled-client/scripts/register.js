document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);

    const error = params.get('error');
    if (error) {
        document.getElementById('error-message').textContent = error;
    }

    const username = params.get('username');
    if (username) {
        document.getElementById('username').value = username;
    }

    const email = params.get('email');
    if (email) {
        document.getElementById('email').value = email;
    }

});
