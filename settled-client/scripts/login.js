document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);

    const error = params.get('error');
    if (error) {
        document.getElementById('error-message').textContent = error;
    }

    const email = params.get('email');
    if (email) {
        document.getElementById('email').value = email;
    }

});
