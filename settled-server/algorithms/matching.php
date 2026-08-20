<?php

function get_trip_energy_and_interests($mysql, $trip_id) {
    $sql = "SELECT energy_level, interests FROM trip_members WHERE trip_id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("i", $trip_id);
    $query->execute();
    $array = $query->get_result();

    $energy_total = 0;
    $member_count = 0;
    $interest_counts = [];

    while($row = $array->fetch_assoc()) {
        $energy_total += $row["energy_level"];
        $member_count++;

        $interests = $row["interests"] != null ? json_decode($row["interests"]) : [];
        foreach($interests as $interest) {
            $interest_counts[$interest] = ($interest_counts[$interest] ?? 0) + 1;
        }
    }

    if($member_count == 0) {
        return null;
    }

    $result = [];
    $result["target_energy"] = (int)round($energy_total / $member_count);
    $result["interest_counts"] = $interest_counts;
    return $result;
}

function match_activity_for_slot($mysql, $trip_id, $time_of_day, $excluded_activity_ids) {
    $sql = "SELECT budget_tier FROM trips WHERE id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("i", $trip_id);
    $query->execute();
    $array = $query->get_result();
    $trip = $array->fetch_assoc();

    if($trip == null) {
        return null;
    }

    $budget_tier = $trip["budget_tier"];

    $trip_data = get_trip_energy_and_interests($mysql, $trip_id);

    if($trip_data == null) {
        return null;
    }

    $target_energy = $trip_data["target_energy"];
    $interest_counts = $trip_data["interest_counts"];

    $sql = "SELECT id, name, category, energy_level, time_of_day, cost_tier, description FROM activities WHERE cost_tier <= ? AND time_of_day = ?";
    $types = "is";
    $params = [$budget_tier, $time_of_day];

    if(count($excluded_activity_ids) > 0) {
        $placeholders = implode(",", array_fill(0, count($excluded_activity_ids), "?"));
        $sql .= " AND id NOT IN ($placeholders)";
        $types .= str_repeat("i", count($excluded_activity_ids));
        foreach($excluded_activity_ids as $excluded_id) {
            $params[] = (int)$excluded_id;
        }
    }

    $sql .= " ORDER BY id ASC";

    $query = $mysql->prepare($sql);
    $query->bind_param($types, ...$params);
    $query->execute();
    $array = $query->get_result();

    $best_activity = null;
    $best_score = null;

    while($row = $array->fetch_assoc()) {
        $energy_diff = abs($target_energy - $row["energy_level"]);

        if($energy_diff == 0) {
            $energy_score = 3;
        } else if($energy_diff == 1) {
            $energy_score = 2;
        } else {
            $energy_score = 0;
        }

        $interest_score = $interest_counts[$row["category"]] ?? 0;
        $total_score = $energy_score + $interest_score;

        if($best_activity == null || $total_score > $best_score) {
            $best_activity = $row;
            $best_score = $total_score;
        }
    }

    return $best_activity;
}

?>
