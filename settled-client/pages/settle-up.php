<?php

include("../../settled-server/auth_check.php");

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Settle Up — Settled</title>
<link rel="stylesheet" href="../styles/base.css?v=6">
<link rel="stylesheet" href="../styles/settle-up.css?v=1">
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
    <h1>Settle Up</h1>
    <p class="sub">Where your money stands, and what closes it out.</p>
</div>

<p id="settle-up-error" class="error-text"></p>

<div class="settle-empty" id="settle-empty" hidden>
    <div class="settle-empty-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
    </div>
    <h2>All settled up</h2>
    <p id="settle-empty-message">Nothing to settle until expenses come in.</p>
</div>

<div id="settle-content" hidden>

    <div class="balance-hero" id="balance-hero">
        <div class="hero-badge" id="hero-badge"></div>
        <div class="hero-copy">
            <span class="hero-label" id="hero-label"></span>
            <span class="hero-amount" id="hero-amount"></span>
        </div>
    </div>

    <div class="section-head" style="margin-top:26px;">
        <h2>Your payments</h2>
        <span class="hint" id="your-payments-hint"></span>
    </div>
    <div class="your-plan-list" id="your-plan-list"></div>

    <details class="disclosure" open>
        <summary>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            Show the full group breakdown
        </summary>
        <div class="disclosure-body">

            <div>
                <div class="section-head" style="margin-bottom:8px;"><h2>Everyone's balance</h2></div>
                <div class="mini-ledger" id="everyone-ledger"></div>
            </div>

            <div id="rest-of-plan-block">
                <div class="section-head" style="margin-bottom:8px;"><h2>Rest of the plan</h2></div>
                <div class="mini-ledger" id="rest-of-plan"></div>
            </div>

        </div>
    </details>

</div>

</div>

<script src="../scripts/axios.min.js"></script>
<script src="../scripts/helper.js?v=5"></script>
<script src="../scripts/settle-up.js"></script>
</body>
</html>
