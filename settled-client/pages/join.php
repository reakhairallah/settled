<?php

include("../../settled-server/auth_check.php");

$code = trim($_GET["code"] ?? "");

if($code != "") {
    header("Location: dashboard.php?open=join&code=" . urlencode($code));
    exit;
}

header("Location: dashboard.php?open=join");
exit;

?>
