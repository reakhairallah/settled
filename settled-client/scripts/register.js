document.addEventListener('DOMContentLoaded', () => {
    redirect_if_logged_in('dashboard.php');
    repopulate_form_from_query_string(['username', 'email']);
});
