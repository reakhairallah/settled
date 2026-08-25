<?php

include("../../settled-server/auth_check.php");

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Expenses — Settled</title>
<link rel="stylesheet" href="../styles/base.css?v=6">
<link rel="stylesheet" href="../styles/expenses.css?v=2">
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
    <div>
        <h1>Expenses</h1>
        <p class="sub">Log what you paid for, split with the trip or keep it to yourself.</p>
    </div>
    <span class="stat-chip">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        <span>Trip total</span>
        <strong id="trip-total">$0.00</strong>
    </span>
</div>

<p id="expenses-error" class="error-text"></p>

<div class="add-expense-card">
    <div class="add-expense-head">
        <div class="add-expense-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </div>
        <h2>Add an expense</h2>
    </div>

    <form id="add-expense-form" novalidate>
        <div class="field-row">
            <div class="field">
                <label for="amount">Amount</label>
                <div class="amount-input-wrap">
                    <span class="prefix">$</span>
                    <input type="number" id="amount" name="amount" step="0.01" min="0.01" placeholder="0.00">
                </div>
            </div>
            <div class="field">
                <label for="description">Description</label>
                <input type="text" id="description" name="description" placeholder="e.g. Dinner at Time Out Market">
            </div>
        </div>

        <div class="personal-toggle">
            <div class="copy">
                <strong>Keep this personal</strong>
                <span>Not split with anyone, visible only to you</span>
            </div>
            <label class="switch">
                <input type="checkbox" id="personal-switch">
                <span class="track"></span>
                <span class="thumb"></span>
            </label>
        </div>

        <div class="field-block" id="split-field-block">
            <div class="field-block-head">
                <label>Split with</label>
                <button type="button" class="split-bulk" id="split-bulk-toggle">Deselect all</button>
            </div>
            <div class="chip-select" id="split-chips"></div>
        </div>

        <p id="add-expense-error" class="error-text"></p>

        <button type="submit" class="btn btn-primary btn-add-expense">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Add expense
        </button>
    </form>
</div>

<div class="tabs">
    <button type="button" class="tab active" data-tab="trip" id="tab-trip">
        Trip expenses <span class="count" id="trip-count">0</span>
    </button>
    <button type="button" class="tab" data-tab="personal" id="tab-personal">
        My personal <span class="count" id="personal-count">0</span>
    </button>
</div>
<p class="tab-sub" id="tab-sub"></p>

<div class="tab-panel" id="panel-trip"></div>
<div class="tab-panel" id="panel-personal" hidden></div>

</div>

<script src="../scripts/axios.min.js"></script>
<script src="../scripts/helper.js?v=5"></script>
<script src="../scripts/expenses.js"></script>
</body>
</html>
