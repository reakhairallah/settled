// captured synchronously while this script is loading, since document.currentScript
// is only valid during a plain script's own initial top-level execution. Anchoring
// to helper.js's own fixed location (rather than the calling page's) is what lets
// redirect_if_logged_in build a correct API URL regardless of how deep the calling
// page sits (settled-client/pages/ two levels down, or the site root zero levels
// down) without needing every caller to pass its own depth in.
const HELPER_SCRIPT_SRC = document.currentScript ? document.currentScript.src : null;

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
    const session_check_url = HELPER_SCRIPT_SRC
        ? new URL('../../settled-server/api/session-check-handler.php', HELPER_SCRIPT_SRC).href
        : '../../settled-server/api/session-check-handler.php';

    axios.get(session_check_url)
        .then((response) => {
            if (response.data.success && response.data.data.logged_in) {
                window.location.href = redirect_url;
            }
        });
}

const VIBE_COLORS = ['#EC5A96', '#3E8EF7', '#F5B830', '#34C471', '#FF8A3D'];

function format_date(dateStr) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const [y, m, d] = dateStr.split('-').map(Number);
    return { month: months[m - 1], day: String(d).padStart(2, '0'), year: String(y) };
}

function color_for_initials(initials) {
    let sum = 0;
    for (const ch of initials) sum += ch.charCodeAt(0);
    return VIBE_COLORS[sum % VIBE_COLORS.length];
}

function format_money(amount) {
    return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// fills a .budget-pill element with 3 individual $ spans, filled up to
// tier -- shared so itinerary's activity cost tags and trip-view's own
// budget pill can never visually drift apart from each other again
function fill_budget_pill(pillElement, tier) {
    pillElement.textContent = '';
    for (let i = 1; i <= 3; i++) {
        const sign = document.createElement('span');
        sign.className = i <= tier ? 'filled' : '';
        sign.textContent = '$';
        pillElement.appendChild(sign);
    }
}

function get_initials(username) {
    const parts = username.trim().split(/\s+/);
    if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
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

function wire_segmented(container, hiddenInput) {
    container.querySelectorAll('.segmented-option').forEach((button) => {
        button.addEventListener('click', () => {
            container.querySelectorAll('.segmented-option').forEach((b) => b.classList.remove('selected'));
            button.classList.add('selected');
            hiddenInput.value = button.dataset.value;
        });
    });
}

let modalTriggerEl = null;

function set_modal_label(contentEl) {
    const heading = contentEl.querySelector('form:not([hidden]) h1');
    const dialog = document.getElementById('modal-panel');
    if (heading && dialog) {
        dialog.setAttribute('aria-labelledby', heading.id);
    }
}

function focus_first_field(contentEl) {
    const field = contentEl.querySelector('form:not([hidden]) input, form:not([hidden]) button, form:not([hidden]) select, form:not([hidden]) textarea');
    if (field) {
        field.focus();
    }
}

function open_modal(contentEl, triggerEl) {
    const dialog = document.getElementById('modal-panel');

    document.querySelectorAll('.modal-content').forEach((el) => el.setAttribute('hidden', ''));
    contentEl.removeAttribute('hidden');

    modalTriggerEl = triggerEl || document.activeElement;

    set_modal_label(contentEl);
    dialog.showModal();
    focus_first_field(contentEl);
}

function close_modal() {
    document.getElementById('modal-panel').close();
}

function build_invite_link(inviteCode) {
    return new URL('join.php?code=' + encodeURIComponent(inviteCode), window.location.href).href;
}

function init_modal_shell() {
    const dialog = document.getElementById('modal-panel');
    const closeBtn = document.getElementById('modal-close');

    closeBtn.addEventListener('click', close_modal);

    dialog.addEventListener('click', (event) => {
        const rect = dialog.getBoundingClientRect();
        const clickedInside = event.clientX >= rect.left && event.clientX <= rect.right
            && event.clientY >= rect.top && event.clientY <= rect.bottom;
        if (!clickedInside) {
            close_modal();
        }
    });

    dialog.addEventListener('close', () => {
        if (modalTriggerEl) {
            modalTriggerEl.focus();
            modalTriggerEl = null;
        }
        document.dispatchEvent(new CustomEvent('modal:closed'));
    });
}

function wire_preferences_form(preferencesForm, preferencesError, getTripId) {
    preferencesForm.addEventListener('submit', (event) => {
        event.preventDefault();
        preferencesError.textContent = '';

        const energyLevelInput = preferencesForm.querySelector('input[name="energy_level"]');
        if (!energyLevelInput.value) {
            preferencesError.textContent = 'Please select an energy level.';
            return;
        }

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
