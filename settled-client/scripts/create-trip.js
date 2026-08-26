document.addEventListener('DOMContentLoaded', () => {
    const modalContent = document.getElementById('create-modal-content');
    const tripForm = document.getElementById('create-trip-form');
    const preferencesForm = document.getElementById('create-preferences-form');
    const tripError = document.getElementById('create-trip-error');
    const preferencesError = document.getElementById('create-preferences-error');
    const budgetTierInput = document.getElementById('create-budget-tier');
    const energyLevelInput = document.getElementById('create-energy-level');
    const nameInput = document.getElementById('name');
    const startDateInput = document.getElementById('start_date');
    const endDateInput = document.getElementById('end_date');
    let tripId = null;

    wire_segmented(tripForm.querySelector('.segmented'), budgetTierInput);
    wire_segmented(preferencesForm.querySelector('.segmented'), energyLevelInput);

    function today_date_string() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return now.getFullYear() + '-' + month + '-' + day;
    }

    const todayString = today_date_string();
    startDateInput.min = todayString;
    endDateInput.min = todayString;

    startDateInput.addEventListener('change', () => {
        endDateInput.min = startDateInput.value || todayString;
        if (endDateInput.value && endDateInput.value < endDateInput.min) {
            endDateInput.value = '';
        }
    });

    [nameInput, startDateInput, endDateInput].forEach((input) => {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                tripForm.requestSubmit();
            }
        });
    });

    function reset_form() {
        tripForm.reset();
        preferencesForm.reset();
        tripForm.hidden = false;
        preferencesForm.hidden = true;
        tripError.textContent = '';
        preferencesError.textContent = '';
        tripForm.querySelectorAll('.segmented-option.selected').forEach((b) => b.classList.remove('selected'));
        preferencesForm.querySelectorAll('.segmented-option.selected').forEach((b) => b.classList.remove('selected'));
        tripId = null;
    }

    document.addEventListener('modal:closed', reset_form);

    document.querySelectorAll('[data-modal="create"]').forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            open_modal(modalContent, trigger);
        });
    });

    tripForm.addEventListener('submit', (event) => {
        event.preventDefault();
        tripError.textContent = '';

        if (nameInput.value.trim() === '' || startDateInput.value === '' || endDateInput.value === '' || budgetTierInput.value === '') {
            tripError.textContent = 'All fields are required.';
            return;
        }

        if (nameInput.value.trim().length > 100) {
            tripError.textContent = 'Trip name must be 100 characters or less.';
            return;
        }

        const formData = new FormData(tripForm);

        axios.post('../../settled-server/api/create-trip-handler.php', formData)
            .then((response) => {
                if (response.data.success) {
                    tripId = response.data.data.trip_id;
                    tripForm.hidden = true;
                    preferencesForm.hidden = false;
                    set_modal_label(modalContent);
                    focus_first_field(modalContent);
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
