<?php

include("connection.php");
include("activities-factories.php");

foreach($activities as $activity) {
    $sql = "INSERT INTO activities(name, category, energy_level, time_of_day, cost_tier, description) VALUES(?, ?, ?, ?, ?, ?)";
    $query = $mysql->prepare($sql);
    $query->bind_param("ssisis", $activity["name"], $activity["category"], $activity["energy_level"], $activity["time_of_day"], $activity["cost_tier"], $activity["description"]);
    $query->execute();
}

$categories = ["Food & Dining", "Outdoors", "Nightlife", "Culture & Museums", "Shopping", "Relaxation"];
$energy_levels = [1, 2, 3];
$times_of_day = ["morning", "afternoon", "evening"];

$sql = "SELECT category, energy_level, time_of_day, COUNT(*) AS total FROM activities GROUP BY category, energy_level, time_of_day";
$query = $mysql->prepare($sql);
$query->execute();
$array = $query->get_result();

$covered = [];
while($row = $array->fetch_assoc()) {
    $key = $row["category"] . "|" . $row["energy_level"] . "|" . $row["time_of_day"];
    $covered[$key] = $row["total"];
}

$missing = [];
foreach($categories as $category) {
    foreach($energy_levels as $energy_level) {
        foreach($times_of_day as $time_of_day) {
            $key = $category . "|" . $energy_level . "|" . $time_of_day;
            if(!isset($covered[$key])) {
                $missing[] = $key;
            }
        }
    }
}

if(count($missing) > 0) {
    echo "WARNING: missing coverage for: " . implode(", ", $missing) . "\n";
} else {
    echo "Coverage check passed: all category x energy_level x time_of_day combinations have at least one activity.\n";
}

echo "Seeded " . count($activities) . " activities.";

?>
