<?php

include("../database/connection.php");
session_start();

function back_to_login($error, $email) {
    $params = [];
    $params["error"] = $error;
    $params["email"] = $email;
    header("Location: ../../settled-client/pages/login.html?" . http_build_query($params));
    exit;
}

if($_SERVER["REQUEST_METHOD"] != "POST") {
    header("Location: ../../settled-client/pages/login.html");
    exit;
}

$email = trim($_POST["email"] ?? "");
$password = (string)($_POST["password"] ?? "");

if($email == "" || $password == "") {
    back_to_login("All fields are required.", $email);
}

$sql = "SELECT id, password_hash FROM users WHERE email = ?";
$query = $mysql->prepare($sql);
$query->bind_param("s", $email);
$query->execute();
$array = $query->get_result();
$row = $array->fetch_assoc();

if($row == null) {
    back_to_login("Invalid email or password.", $email);
}

if(!password_verify($password, $row["password_hash"])) {
    back_to_login("Invalid email or password.", $email);
}

session_regenerate_id(true);
$_SESSION["user_id"] = $row["id"];

header("Location: ../../settled-client/pages/placeholder.html");
exit;

?>
