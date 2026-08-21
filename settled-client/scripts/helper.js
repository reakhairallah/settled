function repopulate_form_from_query_string(fields) {
    const params = new URLSearchParams(window.location.search);

    const error = params.get('error');
    if (error) {
        document.getElementById('error-message').textContent = error;
    }

    fields.forEach((field) => {
        const value = params.get(field);
        if (value) {
            document.getElementById(field).value = value;
        }
    });
}

function extract_axios_error_message(error) {
    return error.response?.data?.error ?? 'Something went wrong. Please try again.';
}

function redirect_if_logged_in(redirect_url) {
    axios.get('../../settled-server/api/session-check-handler.php')
        .then((response) => {
            if (response.data.success && response.data.data.logged_in) {
                window.location.href = redirect_url;
            }
        });
}

const VIBE_COLORS = ['#EC5A96', '#3E8EF7', '#F5B830', '#34C471', '#FF8A3D'];

function color_for_initials(initials) {
    let sum = 0;
    for (const ch of initials) sum += ch.charCodeAt(0);
    return VIBE_COLORS[sum % VIBE_COLORS.length];
}

function init_topbar(activePage) {
    document.querySelectorAll('.nav-link').forEach((link) => {
        const isActive = link.dataset.page === activePage;
        link.classList.toggle('active', isActive);

        if (isActive) {
            link.setAttribute('aria-current', 'page');
            link.addEventListener('click', (event) => event.preventDefault());
        }
    });

    const profileAvatar = document.getElementById('profile-avatar');
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');
    const logoutBtn = document.getElementById('logout-btn');

    axios.get('../../settled-server/api/session-info-handler.php')
        .then((response) => {
            if (response.data.success) {
                const info = response.data.data;
                profileAvatar.textContent = info.initials;
                profileAvatar.style.background = color_for_initials(info.initials);
                profileUsername.textContent = info.username;
                profileEmail.textContent = info.email;
            }
        });

    logoutBtn.addEventListener('click', () => {
        window.location.href = '../../settled-server/api/logout-handler.php';
    });
}

function wire_preferences_form(preferencesForm, preferencesError, getTripId) {
    preferencesForm.addEventListener('submit', (event) => {
        event.preventDefault();
        preferencesError.textContent = '';

        const formData = new FormData(preferencesForm);
        formData.append('trip_id', getTripId());

        axios.post('../../settled-server/api/trip-preferences-handler.php', formData)
            .then((response) => {
                if (response.data.success) {
                    window.location.href = 'trip-view.php?id=' + getTripId();
                } else {
                    preferencesError.textContent = response.data.error;
                }
            })
            .catch((error) => {
                preferencesError.textContent = extract_axios_error_message(error);
            });
    });
}
