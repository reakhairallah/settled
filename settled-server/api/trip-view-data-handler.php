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
$trip_id = (int)($_GET["trip_id"] ?? 0);

if($trip_id <= 0) {
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

$sql = "SELECT COUNT(*) AS total FROM trip_members WHERE trip_id = ? AND user_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("ii", $trip_id, $user_id);
$query->execute();
$array = $query->get_result();
$row = $array->fetch_assoc();

if($row["total"] == 0) {
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

$sql = "SELECT name, destination, start_date, end_date, invite_code FROM trips WHERE id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();
$trip = $array->fetch_assoc();

$sql = "SELECT users.username, trip_members.energy_level, trip_members.interests
        FROM trip_members
        INNER JOIN users ON users.id = trip_members.user_id
        WHERE trip_members.trip_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();

$members = [];
while($row = $array->fetch_assoc()) {
    $row["interests"] = $row["interests"] != null ? json_decode($row["interests"]) : [];
    $members[] = $row;
}

$data = [];
$data["trip"] = $trip;
$data["members"] = $members;
echo json_encode(["success" => true, "data" => $data]);

?>
