<?php

include("../../settled-server/auth_check.php");

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Itinerary — Settled</title>
<link rel="stylesheet" href="../styles/base.css?v=7">
<link rel="stylesheet" href="../styles/itinerary.css?v=1">
</head>
<body>

<div class="page">

<div class="topbar">
    <a class="wordmark-text" href="dashboard.php"><span>Settled.</span></a>
    <nav class="topbar-nav">
        <a class="trip-pill" id="trip-pill" href="#">
            <span id="trip-pill-name">Trip</span>
        </a>
    </nav>
    <div class="topbar-actions">
        <div class="profile-wrap" tabindex="0">
            <div class="profile-avatar" id="profile-avatar"></div>
            <div class="profile-dropdown">
                <div class="profile-identity">
                    <div class="profile-name" id="profile-username"></div>
                    <div class="profile-email" id="profile-email"></div>
                </div>
                <button type="button" id="logout-btn">Log out</button>
            </div>
        </div>
    </div>
</div>

<div class="page-head">
    <h1>Your itinerary</h1>
    <p class="sub">Vote slots up or down, or see why an activity was picked for you.</p>
</div>

<p id="itinerary-error" class="error-text"></p>

<div class="itinerary-empty" id="itinerary-empty" hidden>
    <div class="itinerary-empty-icon">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 12h18M3 18h11"/></svg>
    </div>
    <h2>No itinerary yet</h2>
    <p id="generate-itinerary-message">Once everyone's set their energy and interests, generate a day-by-day plan the whole group can vote on.</p>
    <button class="btn btn-soft" id="generate-itinerary-button" type="button">
        <span id="generate-itinerary-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/></svg></span>
        <span id="generate-itinerary-label">Generate itinerary</span>
    </button>
</div>

<div id="itinerary-timeline" hidden>
    <div class="progress-row"><span>Locked in</span><strong id="progress-count"></strong></div>
    <div class="progress-track"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
    <div class="day-nav" id="day-nav"></div>
    <div id="days-container"></div>
</div>

</div>

<dialog class="modal-panel" id="modal-panel">
    <button class="modal-close" type="button" id="modal-close" aria-label="Close">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
    <div class="modal-content" id="assign-modal-content" hidden>
        <form id="assign-form">
            <div class="assign-head">
                <h1 id="assign-modal-heading">Assign an activity</h1>
            </div>
            <input class="assign-search" type="text" id="assign-search-input" placeholder="Search activities…">
            <div class="assign-filters" id="assign-filters"></div>
            <div class="assign-list-wrap">
                <div class="assign-list" id="assign-list"></div>
            </div>
            <p class="error-text" id="assign-error"></p>
            <div class="assign-actions">
                <button type="button" class="btn btn-ghost" id="assign-cancel-btn">Cancel</button>
                <button type="submit" class="btn btn-soft" id="assign-submit-btn">Assign activity</button>
            </div>
        </form>
    </div>
</dialog>

<script src="../scripts/axios.min.js"></script>
<script src="../scripts/helper.js?v=5"></script>
<script src="../scripts/itinerary.js?v=1"></script>
</body>
</html>
