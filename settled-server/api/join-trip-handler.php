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
$invite_code = trim($_POST["invite_code"] ?? "");

if($invite_code == "") {
    echo json_encode(["success" => false, "error" => "Please enter an invite code."]);
    exit;
}

$sql = "SELECT id, name, destination FROM trips WHERE invite_code = ?";
$query = $mysql->prepare($sql);
$query->bind_param("s", $invite_code);
$query->execute();
$array = $query->get_result();
$trip = $array->fetch_assoc();

if($trip == null) {
    echo json_encode(["success" => false, "error" => "Invalid invite code."]);
    exit;
}

$trip_id = $trip["id"];

$sql = "SELECT COUNT(*) AS total FROM trip_members WHERE trip_id = ? AND user_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("ii", $trip_id, $user_id);
$query->execute();
$array = $query->get_result();
$row = $array->fetch_assoc();

if($row["total"] > 0) {
    echo json_encode(["success" => false, "error" => "You're already a member of this trip."]);
    exit;
}

$_SESSION["pending_trip_id"] = $trip_id;

$data = [];
$data["trip_id"] = $trip_id;
$data["name"] = $trip["name"];
$data["destination"] = $trip["destination"];
echo json_encode(["success" => true, "data" => $data]);

?>
