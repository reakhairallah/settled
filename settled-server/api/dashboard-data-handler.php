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

$sql = "SELECT trips.id, trips.name, trips.start_date, trips.end_date, trips.invite_code, COUNT(trip_members.id) AS member_count
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

foreach($trips as &$trip) {
    $sql = "SELECT users.username
            FROM trip_members
            INNER JOIN users ON users.id = trip_members.user_id
            WHERE trip_members.trip_id = ?
            ORDER BY trip_members.id ASC";
    $query = $mysql->prepare($sql);
    $query->bind_param("i", $trip["id"]);
    $query->execute();
    $array = $query->get_result();

    $member_usernames = [];
    while($row = $array->fetch_assoc()) {
        $member_usernames[] = $row["username"];
    }
    $trip["member_usernames"] = $member_usernames;
}
unset($trip);

$sql = "SELECT id FROM trips
        WHERE id IN (SELECT trip_id FROM trip_members WHERE user_id = ?) AND start_date >= CURDATE()
        ORDER BY start_date ASC, id ASC
        LIMIT 1";
$query = $mysql->prepare($sql);
$query->bind_param("i", $user_id);
$query->execute();
$array = $query->get_result();
$row = $array->fetch_assoc();
$next_trip_id = $row != null ? (int)$row["id"] : null;

$data = [];
$data["trips"] = $trips;
$data["next_trip_id"] = $next_trip_id;
echo json_encode(["success" => true, "data" => $data]);

?>
