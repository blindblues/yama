<?php
// Test script per verificare che l'API funzioni
header('Content-Type: application/json');

// Test data
$testData = [
    'category' => 'adulti',
    'courses' => [
        [
            'id' => 'test_course_123',
            'name' => 'Test Course',
            'description' => 'Test Description',
            'category' => 'adulti',
            'instructors' => 'Test Instructor',
            'schedule' => [],
            'level' => '',
            'duration' => '',
            'price' => '',
            'image' => ''
        ]
    ]
];

// Call the save-courses.php API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://' . $_SERVER['HTTP_HOST'] . '/api/save-courses.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo json_encode([
    'success' => $httpCode === 200,
    'http_code' => $httpCode,
    'response' => json_decode($response, true)
]);
?>
