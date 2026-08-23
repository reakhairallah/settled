<?php

include("../../settled-server/auth_check.php");

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Trip — Settled</title>
<link rel="stylesheet" href="../styles/base.css?v=4">
<link rel="stylesheet" href="../styles/trip-view.css?v=7">
</head>
<body>

<div class="page">

<div class="topbar">
    <a class="wordmark-text" href="dashboard.php"><span>Settled.</span></a>
    <nav class="topbar-nav">
        <a class="trip-pill" id="trip-pill" href="#trip-details">
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

<h1 class="sr-only" id="trip-view-title">Trip</h1>

<p id="trip-view-error" class="error-text"></p>

<div class="widget-grid" id="widget-grid">

    <div class="widget-card" id="itinerary-widget" style="--hub-color:#EC5A96;">
        <div class="widget-head">
            <div class="widget-head-title">
                <div class="widget-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 12h18M3 18h11"/></svg>
                </div>
                <h3>Itinerary</h3>
            </div>
            <svg class="widget-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>
        </div>
        <div class="widget-body" id="itinerary-widget-body"></div>
        <a class="widget-card-hitbox" id="itinerary-widget-link" href="itinerary.php">View itinerary</a>
    </div>

    <div class="widget-card" id="expenses-widget" style="--hub-color:#3E8EF7;">
        <div class="widget-head">
            <div class="widget-head-title">
                <div class="widget-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <h3>Expenses</h3>
            </div>
            <svg class="widget-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>
        </div>
        <div class="widget-body" id="expenses-widget-body"></div>
        <a class="widget-card-hitbox" id="expenses-widget-link" href="expenses.php">View expenses</a>
    </div>

    <div class="widget-card" id="settle-widget" style="--hub-color:#34C471;">
        <div class="widget-head">
            <div class="widget-head-title">
                <div class="widget-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                </div>
                <h3>Settle up</h3>
            </div>
            <svg class="widget-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>
        </div>
        <div class="widget-body" id="settle-widget-body"></div>
        <a class="widget-card-hitbox" id="settle-widget-link" href="settle-up.php">View settle up</a>
    </div>

</div>

<div class="section-head" id="trip-details">
    <h2>Trip details</h2>
</div>

<div class="boarding-pass">
  <div class="boarding-pass-top">
    <div class="pass-main">
        <div>
            <p class="pass-eyebrow">Trip pass</p>
            <h2 class="pass-title" id="pass-title"></h2>
        </div>
        <div class="pass-route">
            <div class="pass-date">
                <span class="pass-date-label">Departs</span>
                <span class="pass-date-value" id="pass-departs"></span>
            </div>
            <div class="pass-route-line">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </div>
            <div class="pass-date">
                <span class="pass-date-label">Returns</span>
                <span class="pass-date-value" id="pass-returns"></span>
            </div>
        </div>
        <div class="pass-footer">
            <div class="tier-meter">
                <span class="tier-caption">Budget</span>
                <div class="tier-pips" id="budget-pips"></div>
            </div>
        </div>
    </div>

    <div class="pass-perf"></div>

    <div class="pass-stub">
        <div>
            <span class="pass-stub-label">Invite code</span>
            <div class="pass-stub-code" id="invite-code-value"></div>
        </div>
        <div class="pass-stub-actions">
            <button type="button" class="copy-btn" id="copy-invite-code-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy code
            </button>
            <button type="button" class="copy-btn" id="copy-invite-link-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                Copy link
            </button>
        </div>
    </div>
  </div>

  <div class="pass-manifest-seam"></div>

  <div class="pass-manifest">
    <p class="manifest-eyebrow" id="manifest-eyebrow">Members</p>
    <div id="manifest-container"></div>
  </div>
</div>

</div>

<script src="../scripts/axios.min.js"></script>
<script src="../scripts/helper.js?v=4"></script>
<script src="../scripts/trip-view.js?v=4"></script>
</body>
</html>
