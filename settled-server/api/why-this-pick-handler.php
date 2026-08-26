<?php

function gemini_request_once($api_key, $prompt) {
    $model = "gemini-flash-lite-latest";
    $url = "https://generativelanguage.googleapis.com/v1beta/models/" . $model . ":generateContent?key=" . $api_key;

    $part = [];
    $part["text"] = $prompt;

    $parts = [];
    $parts[] = $part;

    $content = [];
    $content["parts"] = $parts;

    $contents = [];
    $contents[] = $content;

    $body_data = [];
    $body_data["contents"] = $contents;

    $body = json_encode($body_data);

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $body);
    curl_setopt($curl, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_TIMEOUT, 8);
    curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 4);

    $response = curl_exec($curl);
    $http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($curl);
    curl_close($curl);

    if($response == false || $curl_error != "" || $http_code != 200) {
        return null;
    }

    $decoded = json_decode($response, true);
    $blurb = $decoded["candidates"][0]["content"]["parts"][0]["text"] ?? null;

    if($blurb == null || trim($blurb) == "") {
        return null;
    }

    $blurb = trim($blurb);

    if(strlen($blurb) > 230) {
        return null;
    }

    return $blurb;
}

function call_gemini($api_key, $prompt) {
    $attempts = 0;

    while($attempts < 2) {
        $blurb = gemini_request_once($api_key, $prompt);

        if($blurb != null) {
            return $blurb;
        }

        $attempts++;
    }

    return null;
}

include("../database/connection.php");
include("../trip_helpers.php");

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
$slot_id = (int)($_GET["slot_id"] ?? 0);

if($slot_id <= 0) {
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

$sql = "SELECT trip_id, activity_id FROM itinerary_slots WHERE id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $slot_id);
$query->execute();
$array = $query->get_result();
$slot = $array->fetch_assoc();

if($slot == null) {
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

$trip_id = $slot["trip_id"];

$trip_member = get_trip_member($mysql, $trip_id, $user_id);

if($trip_member == null) {
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

if($slot["activity_id"] == null) {
    echo json_encode(["success" => false, "error" => "No activity assigned to this slot yet."]);
    exit;
}

$sql = "SELECT name, category, energy_level FROM activities WHERE id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $slot["activity_id"]);
$query->execute();
$array = $query->get_result();
$activity = $array->fetch_assoc();

$sql = "SELECT trip_members.id, users.username, trip_members.energy_level, trip_members.interests
        FROM trip_members
        INNER JOIN users ON users.id = trip_members.user_id
        WHERE trip_members.trip_id = ?";
$query = $mysql->prepare($sql);
$query->bind_param("i", $trip_id);
$query->execute();
$array = $query->get_result();

$members = [];

while($row = $array->fetch_assoc()) {
    $interests = $row["interests"] != null ? json_decode($row["interests"]) : [];
    $interested = in_array($activity["category"], $interests) ? "yes" : "no";

    $member = [];
    $member["username"] = $row["username"];
    $member["energy_level"] = $row["energy_level"];
    $member["interested"] = $interested;

    $members[] = $member;
}

$member_summary = "";

foreach($members as $member) {
    $member_summary = $member_summary . $member["username"] . " (energy " . $member["energy_level"] . "/3, interested in " . $activity["category"] . ": " . $member["interested"] . "). ";
}

$prompt = "In 1-2 sentences, explain why " . $activity["name"] . " (category: " . $activity["category"] . ", energy level: " . $activity["energy_level"] . "/3) fits this particular group of people. Here is each member with their personal energy level from 1 (low key) to 3 (high energy) and whether this activity's category is one of their listed interests: " . $member_summary . "Reason about this specific mix of people, not a group average, and do not quote scores or percentages. If the fit is uneven, be honest about it and say who it suits best or least. Name at most two people by username, never list the whole group. A 'no' only means this category is not among that member's listed interests, which is neutral and never counts against them. Stay warm even when you note a mismatch, it is a friendly heads-up and not a reason to skip an activity the group already chose. Write it casually, like a friend's recommendation. Do not use em dashes or en dashes anywhere in the response, use commas or periods instead. Keep the entire response under 180 characters.";

$fallback_blurb = "This one's a solid match for your group's vibe and energy level.";

$secrets = include("../config/secrets.php");
$api_key = $secrets["gemini_api_key"] ?? "";

$blurb = $api_key != "" ? call_gemini($api_key, $prompt) : null;

if($blurb == null) {
    $data = [];
    $data["blurb"] = $fallback_blurb;
    $data["fallback"] = true;
    echo json_encode(["success" => true, "data" => $data]);
    exit;
}

$data = [];
$data["blurb"] = $blurb;
echo json_encode(["success" => true, "data" => $data]);

?>
