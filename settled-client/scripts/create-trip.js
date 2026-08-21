document.addEventListener('DOMContentLoaded', () => {
    const tripForm = document.getElementById('create-trip-form');
    const preferencesForm = document.getElementById('preferences-form');
    const tripError = document.getElementById('trip-error');
    const preferencesError = document.getElementById('preferences-error');
    let tripId = null;

    tripForm.addEventListener('submit', (event) => {
        event.preventDefault();
        tripError.textContent = '';

        const formData = new FormData(tripForm);

        axios.post('../../settled-server/api/create-trip-handler.php', formData)
            .then((response) => {
                if (response.data.success) {
                    tripId = response.data.data.trip_id;
                    tripForm.style.display = 'none';
                    preferencesForm.style.display = 'block';
                } else {
                    tripError.textContent = response.data.error;
                }
            })
            .catch((error) => {
                tripError.textContent = extract_axios_error_message(error);
            });
    });

    wire_preferences_form(preferencesForm, preferencesError, () => tripId);
});
