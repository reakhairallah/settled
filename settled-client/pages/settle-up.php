<?php

include("../../settled-server/auth_check.php");

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Settle Up — Settled</title>
</head>
<body>

<a id="back-link" href="dashboard.php">&larr; Back to Trip</a>

<h1>Settle Up</h1>
<p id="settle-up-error" style="color: red;"></p>

<h2>Balances</h2>
<div id="balances-container"></div>

<h2>Who Pays Who</h2>
<div id="transactions-container"></div>

<script src="../scripts/axios.min.js"></script>
<script src="../scripts/helper.js"></script>
<script src="../scripts/settle-up.js"></script>
</body>
</html>
