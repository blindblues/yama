<?php
// Test script per verificare la scrittura dei file
header('Content-Type: application/json');

$results = [];

// Test 1: Percorso file JSON adulti
$adultiFile = dirname(__DIR__) . '/lib/corsi/adulti/corsi.json';
$results['adulti_file'] = [
    'path' => $adultiFile,
    'exists' => file_exists($adultiFile),
    'writable' => is_writable($adultiFile),
    'dir_writable' => is_writable(dirname($adultiFile))
];

// Test 2: Percorso file JSON ragazzi
$ragazziFile = dirname(__DIR__) . '/lib/corsi/ragazzi/corsi.json';
$results['ragazzi_file'] = [
    'path' => $ragazziFile,
    'exists' => file_exists($ragazziFile),
    'writable' => is_writable($ragazziFile),
    'dir_writable' => is_writable(dirname($ragazziFile))
];

// Test 3: Tentativo scrittura file test
$testFile = dirname(__DIR__) . '/lib/corsi/test_write_' . date('YmdHis') . '.json';
$testData = ['test' => true, 'timestamp' => date('c')];
$testContent = json_encode($testData, JSON_PRETTY_PRINT);

$writeResult = file_put_contents($testFile, $testContent);
$results['test_write'] = [
    'success' => $writeResult !== false,
    'bytes_written' => $writeResult !== false ? $writeResult : 0,
    'test_file' => $testFile,
    'file_exists_after' => file_exists($testFile),
    'file_readable' => file_exists($testFile) ? is_readable($testFile) : false
];

// Pulisci test file
if (file_exists($testFile)) {
    unlink($testFile);
    $results['test_write']['cleanup_success'] = true;
} else {
    $results['test_write']['cleanup_success'] = false;
}

// Test 4: Informazioni server
$results['server_info'] = [
    'php_user' => get_current_user(),
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'not set',
    'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? 'not set',
    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'not set',
    'current_dir' => __DIR__,
    'parent_dir' => dirname(__DIR__)
];

echo json_encode($results, JSON_PRETTY_PRINT);
?>
