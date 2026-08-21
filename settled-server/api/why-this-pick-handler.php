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

    if(strlen($blurb) > 200) {
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
include("../algorithms/matching.php");

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

$trip_data = get_trip_energy_and_interests($mysql, $trip_id);
$target_energy = $trip_data != null ? $trip_data["target_energy"] : 0;
$interest_counts = $trip_data != null ? $trip_data["interest_counts"] : [];
$interest_count = $interest_counts[$activity["category"]] ?? 0;

$prompt = "In 1-2 sentences, explain why " . $activity["name"] . " (category: " . $activity["category"] . ", energy level: " . $activity["energy_level"] . "/3) is a good fit for a group with an average energy level of " . $target_energy . " and " . $interest_count . " members interested in " . $activity["category"] . ". Keep it casual and fun, like a friend's recommendation, not a summary of stats. Do not use em dashes or en dashes anywhere in the response, use commas or periods instead. Keep the entire response under 150 characters.";

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
