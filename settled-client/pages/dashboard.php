<?php

include("../../settled-server/auth_check.php");

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>My Trips — Settled</title>
<link rel="stylesheet" href="../styles/base.css?v=7">
<link rel="stylesheet" href="../styles/dashboard.css?v=4">
</head>
<body>

<div class="page">

<div class="topbar">
    <a class="wordmark-text" href="dashboard.php"><span>Settled.</span></a>
    <div class="topbar-spacer"></div>
    <div class="topbar-actions">
        <div class="topbar-cta">
            <button type="button" class="btn btn-ghost btn-sm" data-modal="join">Join a trip</button>
            <button type="button" class="btn btn-primary btn-sm" data-modal="create">＋ Create a trip</button>
        </div>
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
        <button type="button" class="btn btn-ghost" data-modal="join">Join a trip</button>
        <button type="button" class="btn btn-primary" data-modal="create">＋ Create a trip</button>
    </div>
</div>

</div>

<dialog class="modal-panel" id="modal-panel">
    <button class="modal-close" type="button" id="modal-close" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>

    <div class="modal-content" id="create-modal-content" hidden>
        <form id="create-trip-form" novalidate>
            <div class="form-steps">
                <div class="form-step active">Trip details</div>
                <div class="form-step">Preferences</div>
            </div>

            <div class="form-page-head">
                <h1 id="create-step1-heading">Create a trip</h1>
                <p class="sub">Give it a name and some basics, you can invite everyone right after.</p>
            </div>

                <p id="create-trip-error" class="error-text"></p>

                <div class="field">
                    <label for="name">Trip name</label>
                    <input type="text" id="name" name="name" placeholder="Lisbon Long Weekend" maxlength="100" required>
                </div>

                <div class="field-row">
                    <div class="field">
                        <label for="start_date">Start date</label>
                        <input type="date" id="start_date" name="start_date" required>
                    </div>
                    <div class="field">
                        <label for="end_date">End date</label>
                        <input type="date" id="end_date" name="end_date" required>
                    </div>
                </div>

                <div class="field">
                    <label>Budget</label>
                    <input type="hidden" name="budget_tier" id="create-budget-tier">
                    <div class="segmented">
                        <button type="button" class="segmented-option" data-value="1">$</button>
                        <button type="button" class="segmented-option" data-value="2">$$</button>
                        <button type="button" class="segmented-option" data-value="3">$$$</button>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary">Continue</button>
            </form>

            <form id="create-preferences-form" novalidate hidden>
                <div class="form-steps">
                    <div class="form-step">Trip details</div>
                    <div class="form-step active">Preferences</div>
                </div>

                <div class="form-page-head">
                    <h1 id="create-step2-heading">Set your preferences</h1>
                    <p class="sub">This tunes what gets suggested for you.</p>
                </div>

                <p id="create-preferences-error" class="error-text"></p>

                <div class="field">
                    <label>Energy level</label>
                    <input type="hidden" name="energy_level" id="create-energy-level">
                    <div class="segmented">
                        <button type="button" class="segmented-option" data-value="1">Low</button>
                        <button type="button" class="segmented-option" data-value="2">Medium</button>
                        <button type="button" class="segmented-option" data-value="3">High</button>
                    </div>
                </div>

                <div class="field">
                    <label>Interests <span class="optional-tag">optional</span></label>
                    <div class="chip-select">
                        <label class="chip-option">
                            <input type="checkbox" name="interests[]" value="Food & Dining">
                            <span>Food & Dining</span>
                        </label>
                        <label class="chip-option">
                            <input type="checkbox" name="interests[]" value="Outdoors">
                            <span>Outdoors</span>
                        </label>
                        <label class="chip-option">
                            <input type="checkbox" name="interests[]" value="Nightlife">
                            <span>Nightlife</span>
                        </label>
                        <label class="chip-option">
                            <input type="checkbox" name="interests[]" value="Culture & Museums">
                            <span>Culture & Museums</span>
                        </label>
                        <label class="chip-option">
                            <input type="checkbox" name="interests[]" value="Shopping">
                            <span>Shopping</span>
                        </label>
                        <label class="chip-option">
                            <input type="checkbox" name="interests[]" value="Relaxation">
                            <span>Relaxation</span>
                        </label>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary">Finish setup</button>
            </form>
        </div>

        <div class="modal-content" id="join-modal-content" hidden>
            <form id="join-form" novalidate>
                <div class="form-steps">
                    <div class="form-step active">Invite code</div>
                    <div class="form-step">Preferences</div>
                </div>

                <div class="form-page-head">
                    <h1 id="join-step1-heading">Join a trip</h1>
                    <p class="sub">Enter the invite code someone on the trip sent you.</p>
                </div>

                <p id="join-error" class="error-text"></p>

                <div class="field invite-field">
                    <label for="invite_code">Invite code</label>
                    <input type="text" id="invite_code" name="invite_code" class="invite-input" placeholder="LISBON4" maxlength="12" required>
                </div>

                <button type="submit" class="btn btn-primary">Find trip</button>
            </form>

            <form id="join-preferences-form" novalidate hidden>
                <div class="form-steps">
                    <div class="form-step">Invite code</div>
                    <div class="form-step active">Preferences</div>
                </div>

                <div class="form-page-head">
                    <h1 id="join-step2-heading">Set your preferences</h1>
                    <p class="sub">This tunes what gets suggested for you.</p>
                </div>

                <div class="trip-preview-banner" id="join-trip-preview" hidden>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/></svg>
                    <span id="join-trip-preview-text"></span>
                </div>

                <p id="join-preferences-error" class="error-text"></p>

                <div class="field">
                    <label>Energy level</label>
                    <input type="hidden" name="energy_level" id="join-energy-level">
                    <div class="segmented">
                        <button type="button" class="segmented-option" data-value="1">Low</button>
                        <button type="button" class="segmented-option" data-value="2">Medium</button>
                        <button type="button" class="segmented-option" data-value="3">High</button>
                    </div>
                </div>

                <div class="field">
                    <label>Interests <span class="optional-tag">optional</span></label>
                    <div class="chip-select">
                        <label class="chip-option">
                            <input type="checkbox" name="interests[]" value="Food & Dining">
                            <span>Food & Dining</span>
                        </label>
                        <label class="chip-option">
                            <input type="checkbox" name="interests[]" value="Outdoors">
                            <span>Outdoors</span>
                        </label>
                        <label class="chip-option">
                            <input type="checkbox" name="interests[]" value="Nightlife">
                            <span>Nightlife</span>
                        </label>
                        <label class="chip-option">
                            <input type="checkbox" name="interests[]" value="Culture & Museums">
                            <span>Culture & Museums</span>
                        </label>
                        <label class="chip-option">
                            <input type="checkbox" name="interests[]" value="Shopping">
                            <span>Shopping</span>
                        </label>
                        <label class="chip-option">
                            <input type="checkbox" name="interests[]" value="Relaxation">
                            <span>Relaxation</span>
                        </label>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary">Finish setup</button>
            </form>
        </div>
</dialog>

<script src="../scripts/axios.min.js"></script>
<script src="../scripts/helper.js?v=6"></script>
<script src="../scripts/dashboard.js?v=2"></script>
<script src="../scripts/create-trip.js"></script>
<script src="../scripts/join.js"></script>
</body>
</html>
