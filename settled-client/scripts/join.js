document.addEventListener('DOMContentLoaded', () => {
    const modalContent = document.getElementById('join-modal-content');
    const joinForm = document.getElementById('join-form');
    const preferencesForm = document.getElementById('join-preferences-form');
    const joinError = document.getElementById('join-error');
    const preferencesError = document.getElementById('join-preferences-error');
    const tripPreview = document.getElementById('join-trip-preview');
    const tripPreviewText = document.getElementById('join-trip-preview-text');
    const inviteCodeInput = document.getElementById('invite_code');
    const energyLevelInput = document.getElementById('join-energy-level');
    let tripId = null;

    wire_segmented(preferencesForm.querySelector('.segmented'), energyLevelInput);

    inviteCodeInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            joinForm.requestSubmit();
        }
    });

    function reset_form() {
        joinForm.reset();
        preferencesForm.reset();
        joinForm.hidden = false;
        preferencesForm.hidden = true;
        joinError.textContent = '';
        preferencesError.textContent = '';
        tripPreview.hidden = true;
        tripPreviewText.textContent = '';
        preferencesForm.querySelectorAll('.segmented-option.selected').forEach((b) => b.classList.remove('selected'));
        tripId = null;
    }

    document.addEventListener('modal:closed', reset_form);

    document.querySelectorAll('[data-modal="join"]').forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            open_modal(modalContent, trigger);
        });
    });

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
        inviteCodeInput.value = code;
    }
    if (params.get('open') === 'join' || code) {
        open_modal(modalContent);
    }

    joinForm.addEventListener('submit', (event) => {
        event.preventDefault();
        joinError.textContent = '';

        if (inviteCodeInput.value.trim() === '') {
            joinError.textContent = 'Please enter an invite code.';
            return;
        }

        const formData = new FormData(joinForm);

        axios.post('../../settled-server/api/join-trip-handler.php', formData)
            .then((response) => {
                if (response.data.success) {
                    tripId = response.data.data.trip_id;
                    tripPreviewText.textContent = "You're joining " + response.data.data.name;
                    tripPreview.hidden = false;
                    joinForm.hidden = true;
                    preferencesForm.hidden = false;
                    set_modal_label(modalContent);
                    focus_first_field(modalContent);
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
