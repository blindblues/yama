<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$instructorsFile = '../lib/insegnanti.json';

if (file_exists($instructorsFile)) {
    $jsonData = file_get_contents($instructorsFile);
    $data = json_decode($jsonData, true);
    
    if ($data !== null && isset($data['insegnanti'])) {
        echo json_encode([
            'success' => true,
            'instructors' => $data['insegnanti']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid JSON format'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Instructors file not found'
    ]);
}
?>
