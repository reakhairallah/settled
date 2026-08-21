<?php

include("../database/connection.php");

if(session_status() == PHP_SESSION_NONE) {
    session_start();
}

header("Content-Type: application/json");

if(!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Not logged in."]);
    exit;
}

$user_id = $_SESSION["user_id"];

$sql = "SELECT username, email FROM users WHERE id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $user_id);
$query->execute();
$array = $query->get_result();
$row = $array->fetch_assoc();

$data = [];
$data["username"] = $row["username"];
$data["email"] = $row["email"];
$data["initials"] = strtoupper(substr($row["username"], 0, 2));
echo json_encode(["success" => true, "data" => $data]);

?>
