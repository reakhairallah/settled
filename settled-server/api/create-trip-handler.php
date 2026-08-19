<?php

include("../database/connection.php");
include("../db_helpers.php");

if(session_status() == PHP_SESSION_NONE) {
    session_start();
}

header("Content-Type: application/json");

if(!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Not logged in."]);
    exit;
}

function generate_invite_code() {
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    $code = "";
    for($i = 0; $i < 8; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $code;
}

$user_id = $_SESSION["user_id"];

$name = trim($_POST["name"] ?? "");
$destination = trim($_POST["destination"] ?? "");
$start_date = trim($_POST["start_date"] ?? "");
$end_date = trim($_POST["end_date"] ?? "");
$budget_tier = trim($_POST["budget_tier"] ?? "");

if($name == "" || $destination == "" || $start_date == "" || $end_date == "" || $budget_tier == "") {
    echo json_encode(["success" => false, "error" => "All fields are required."]);
    exit;
}

if(!in_array($budget_tier, ["1", "2", "3"])) {
    echo json_encode(["success" => false, "error" => "Budget tier must be 1, 2, or 3."]);
    exit;
}

if(strtotime($start_date) == false || strtotime($end_date) == false) {
    echo json_encode(["success" => false, "error" => "Please enter valid dates."]);
    exit;
}

if($start_date < date("Y-m-d")) {
    echo json_encode(["success" => false, "error" => "Start date cannot be in the past."]);
    exit;
}

if($end_date < $start_date) {
    echo json_encode(["success" => false, "error" => "End date cannot be before start date."]);
    exit;
}

$attempts = 0;
$row = ["total" => 1];

while($row["total"] > 0 && $attempts < 10) {
    $invite_code = generate_invite_code();
    $sql = "SELECT COUNT(*) AS total FROM trips WHERE invite_code = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("s", $invite_code);
    $query->execute();
    $array = $query->get_result();
    $row = $array->fetch_assoc();
    $attempts++;
}

if($row["total"] > 0) {
    echo json_encode(["success" => false, "error" => "Could not generate a unique invite code, please try again."]);
    exit;
}

$budget_tier_int = (int)$budget_tier;

$sql = "INSERT INTO trips(created_by, name, destination, start_date, end_date, budget_tier, invite_code) VALUES(?, ?, ?, ?, ?, ?, ?)";
$query = $mysql->prepare($sql);
$query->bind_param("issssis", $user_id, $name, $destination, $start_date, $end_date, $budget_tier_int, $invite_code);

$duplicate_message = insert_or_duplicate_error($query);
if($duplicate_message != null) {
    echo json_encode(["success" => false, "error" => "Could not generate a unique invite code, please try again."]);
    exit;
}

$trip_id = $mysql->insert_id;

$data = [];
$data["trip_id"] = $trip_id;
echo json_encode(["success" => true, "data" => $data]);

?>
