<?php

include("../database/connection.php");

function back_to_form($error, $username, $email){
    $params = [];
    $params["error"] = $error;
    $params["username"] = $username;
    $params["email"] = $email;
    header("Location: ../../settled-client/pages/register.html?" . http_build_query($params));
    exit;
}

if($_SERVER["REQUEST_METHOD"] != "POST"){
    header("Location: ../../settled-client/pages/register.html");
    exit;
}

$username = trim($_POST["username"] ?? "");
$email = trim($_POST["email"] ?? "");
$password = (string)($_POST["password"] ?? "");
$confirm_password = (string)($_POST["confirm_password"] ?? "");

if($username == "" || $email == "" || $password == "" || $confirm_password == ""){
    back_to_form("All fields are required.", $username, $email);
}

if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
    back_to_form("Please enter a valid email address.", $username, $email);
}

if($password !== $confirm_password){
    back_to_form("Passwords do not match.", $username, $email);
}

if(strlen($password) < 8){
    back_to_form("Password must be at least 8 characters long.", $username, $email);
}

$sql = "SELECT COUNT(*) AS total FROM users WHERE username = ?";
$query = $mysql->prepare($sql);
$query->bind_param("s", $username);
$query->execute();
$array = $query->get_result();
$row = $array->fetch_assoc();

if($row["total"] > 0){
    back_to_form("Username already taken.", $username, $email);
}

$sql = "SELECT COUNT(*) AS total FROM users WHERE email = ?";
$query = $mysql->prepare($sql);
$query->bind_param("s", $email);
$query->execute();
$array = $query->get_result();
$row = $array->fetch_assoc();

if($row["total"] > 0){
    back_to_form("Email already registered.", $username, $email);
}

$password_hash = password_hash($password, PASSWORD_DEFAULT);

$sql = "INSERT INTO users(username, email, password_hash) VALUES(?, ?, ?)";
$query = $mysql->prepare($sql);
$query->bind_param("sss", $username, $email, $password_hash);

if(!$query->execute()){
    $duplicate_field = str_contains($query->error, "username") ? "username" : "email";
    if($duplicate_field == "username"){
        back_to_form("Username already taken.", $username, $email);
    }
    back_to_form("Email already registered.", $username, $email);
}

header("Location: ../../settled-client/pages/login.html");
exit;

?>
