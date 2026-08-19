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

$sql = "SELECT trips.id, trips.name, trips.destination, trips.start_date, trips.end_date, trips.invite_code, COUNT(trip_members.id) AS member_count
        FROM trips
        INNER JOIN trip_members ON trip_members.trip_id = trips.id
        WHERE trips.id IN (SELECT trip_id FROM trip_members WHERE user_id = ?)
        GROUP BY trips.id";
$query = $mysql->prepare($sql);
$query->bind_param("i", $user_id);
$query->execute();
$array = $query->get_result();

$trips = [];
while($row = $array->fetch_assoc()) {
    $trips[] = $row;
}

$data = [];
$data["trips"] = $trips;
echo json_encode(["success" => true, "data" => $data]);

?>
