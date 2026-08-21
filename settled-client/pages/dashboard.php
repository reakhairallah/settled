<?php

include("../../settled-server/auth_check.php");

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>My Trips — Settled</title>
<link rel="stylesheet" href="../styles/base.css">
<link rel="stylesheet" href="../styles/dashboard.css">
</head>
<body>

<div class="page">

<div class="topbar">
    <a class="wordmark-text" href="dashboard.php"><span>Settled.</span></a>
    <nav class="topbar-nav">
        <a class="nav-link" data-page="dashboard" href="dashboard.php">Dashboard</a>
    </nav>
    <div class="topbar-actions">
        <a class="btn btn-ghost btn-sm" href="join.php">Join a trip</a>
        <a class="btn btn-primary btn-sm" href="create-trip.php">＋ Create a trip</a>
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
    <div>
        <h1>My Trips</h1>
        <p class="sub">Every trip you're planning or already on, in one place.</p>
    </div>
    <div class="stat-chips">
        <span class="stat-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
            <strong id="trip-count">0</strong>
            <span>trips</span>
        </span>
        <span class="stat-chip next" id="next-up-chip" hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/></svg>
            <span>Next up:</span>
            <strong id="next-up-name"></strong>
            <span>in</span>
            <span id="next-up-days"></span>
            <span>days</span>
        </span>
    </div>
</div>

<p id="dashboard-error" class="error-text"></p>

<div id="trips-container" class="trip-grid"></div>

<div id="empty-state" class="empty-state">
    <div class="empty-mark">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
    </div>
    <h2>No trips booked yet</h2>
    <p>Start one from scratch, or use an invite code from a friend to join theirs.</p>
    <div class="empty-actions">
        <a class="btn btn-ghost" href="join.php">Join a trip</a>
        <a class="btn btn-primary" href="create-trip.php">＋ Create a trip</a>
    </div>
</div>

</div>

<script src="../scripts/axios.min.js"></script>
<script src="../scripts/helper.js"></script>
<script src="../scripts/dashboard.js"></script>
</body>
</html>
