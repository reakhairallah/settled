<?php

include("../../settled-server/auth_check.php");

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Expenses — Settled</title>
</head>
<body>

<a id="back-link" href="dashboard.php">&larr; Back to Trip</a>

<h1>Expenses</h1>
<p id="expenses-error" style="color: red;"></p>

<form id="add-expense-form">
<label for="amount">Amount</label>
<input type="number" id="amount" name="amount" step="0.01" min="0.01" required>

<label for="description">Description</label>
<input type="text" id="description" name="description">

<fieldset>
<legend>Split with</legend>
<div id="split-members-container"></div>
</fieldset>

<button type="submit">Add Expense</button>
</form>
<p id="add-expense-error" style="color: red;"></p>

<h2>Trip Expenses</h2>
<p>Shared expenses, visible to every trip member.</p>
<div id="trip-expenses-container"></div>

<h2>My Personal Expenses</h2>
<p>Only visible to you.</p>
<div id="personal-expenses-container"></div>

<script src="../scripts/axios.min.js"></script>
<script src="../scripts/helper.js"></script>
<script src="../scripts/expenses.js"></script>
</body>
</html>
