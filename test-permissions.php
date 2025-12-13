<?php
// Test completo dei permessi di scrittura
header('Content-Type: application/json');

$results = [];

// 1. Test permessi directory corrente
$results['current_dir'] = [
    'writable' => is_writable('.'),
    'path' => __DIR__
];

// 2. Test permessi directory course-library
$courseLibraryDir = __DIR__ . '/../lib/corsi';
$results['course_library_dir'] = [
    'exists' => is_dir($courseLibraryDir),
    'writable' => is_writable($courseLibraryDir),
    'path' => $courseLibraryDir
];

// 3. Test permessi directory adulti
$adultiDir = $courseLibraryDir . '/adulti';
$results['adulti_dir'] = [
    'exists' => is_dir($adultiDir),
    'writable' => is_writable($adultiDir),
    'path' => $adultiDir
];

// 4. Test permessi directory ragazzi
$ragazziDir = $courseLibraryDir . '/ragazzi';
$results['ragazzi_dir'] = [
    'exists' => is_dir($ragazziDir),
    'writable' => is_writable($ragazziDir),
    'path' => $ragazziDir
];

// 5. Test scrittura file adulti
$adultiFile = $adultiDir . '/corsi.json';
$results['adulti_file'] = [
    'exists' => file_exists($adultiFile),
    'writable' => is_writable($adultiFile),
    'path' => $adultiFile
];

// 6. Test scrittura file ragazzi
$ragazziFile = $ragazziDir . '/corsi.json';
$results['ragazzi_file'] = [
    'exists' => file_exists($ragazziFile),
    'writable' => is_writable($ragazziFile),
    'path' => $ragazziFile
];

// 7. Test scrittura effettiva
$testFile = __DIR__ . '/test_write_' . date('YmdHis') . '.txt';
$writeTest = file_put_contents($testFile, 'Test write permission');
$results['write_test'] = [
    'success' => $writeTest !== false,
    'test_file' => $testFile,
    'file_exists_after' => file_exists($testFile)
];

// Pulisci il test file
if (file_exists($testFile)) {
    unlink($testFile);
}

// 8. Informazioni PHP
$results['php_info'] = [
    'user' => get_current_user(),
    'uid' => getmyuid(),
    'gid' => getmygid(),
    'safe_mode' => ini_get('safe_mode'),
    'open_basedir' => ini_get('open_basedir'),
    'file_uploads' => ini_get('file_uploads'),
    'upload_tmp_dir' => ini_get('upload_tmp_dir'),
    'max_execution_time' => ini_get('max_execution_time'),
    'memory_limit' => ini_get('memory_limit')
];

echo json_encode($results, JSON_PRETTY_PRINT);
?>
