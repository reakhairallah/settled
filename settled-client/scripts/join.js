document.addEventListener('DOMContentLoaded', () => {
    const joinForm = document.getElementById('join-form');
    const preferencesForm = document.getElementById('preferences-form');
    const joinError = document.getElementById('join-error');
    const preferencesError = document.getElementById('preferences-error');
    const tripPreview = document.getElementById('trip-preview');
    let tripId = null;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
        document.getElementById('invite_code').value = code;
    }

    joinForm.addEventListener('submit', (event) => {
        event.preventDefault();
        joinError.textContent = '';

        const formData = new FormData(joinForm);

        axios.post('../../settled-server/api/join-trip-handler.php', formData)
            .then((response) => {
                if (response.data.success) {
                    tripId = response.data.data.trip_id;
                    tripPreview.textContent = "You're joining " + response.data.data.name;
                    joinForm.style.display = 'none';
                    preferencesForm.style.display = 'block';
                } else {
                    joinError.textContent = response.data.error;
                }
            })
            .catch((error) => {
                joinError.textContent = extract_axios_error_message(error);
            });
    });

    wire_preferences_form(preferencesForm, preferencesError, () => tripId);
});
