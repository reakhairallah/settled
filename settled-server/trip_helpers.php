<?php

function get_trip_member($mysql, $trip_id, $user_id) {
    $sql = "SELECT id FROM trip_members WHERE trip_id = ? AND user_id = ?";
    $query = $mysql->prepare($sql);
    $query->bind_param("ii", $trip_id, $user_id);
    $query->execute();
    $array = $query->get_result();
    return $array->fetch_assoc();
}

?>
