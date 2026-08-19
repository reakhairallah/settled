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
