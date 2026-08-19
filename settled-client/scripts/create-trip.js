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

    preferencesForm.addEventListener('submit', (event) => {
        event.preventDefault();
        preferencesError.textContent = '';

        const formData = new FormData(preferencesForm);
        formData.append('trip_id', tripId);

        axios.post('../../settled-server/api/trip-preferences-handler.php', formData)
            .then((response) => {
                if (response.data.success) {
                    window.location.href = 'placeholder.html';
                } else {
                    preferencesError.textContent = response.data.error;
                }
            })
            .catch((error) => {
                preferencesError.textContent = extract_axios_error_message(error);
            });
    });
});
