<?php
// Versione semplificata per debug del salvataggio corsi
// Disabilita l'output di errori HTML e imposta il gestore di errori personalizzato
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Funzione per gestire gli errori e restituire JSON
function handleError($errno, $errstr, $errfile, $errline) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error',
        'details' => $errstr,
        'file' => basename($errfile),
        'line' => $errline
    ]);
    exit();
}

// Imposta il gestore di errori
set_error_handler('handleError');

// Assicura che l'output sia JSON puro
while (ob_get_level()) ob_end_clean();
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestisci OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function logDebug($message) {
    error_log("[SAVE-COURSES-DEBUG] " . $message);
}

try {
    logDebug("Request received: " . $_SERVER['REQUEST_METHOD']);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }

    $input = file_get_contents('php://input');
    logDebug("Raw input length: " . strlen($input));
    
    if (empty($input)) {
        throw new Exception('No data received');
    }

    $data = json_decode($input, true);
    logDebug("JSON decode result: " . (json_last_error() === JSON_ERROR_NONE ? 'SUCCESS' : 'FAILED: ' . json_last_error_msg()));
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }

    if (!isset($data['category']) || !isset($data['courses'])) {
        throw new Exception('Missing required data: category and courses');
    }

    $category = $data['category'];
    $courses = $data['courses'];
    
    logDebug("Category: $category, Courses count: " . count($courses));

    if (!in_array($category, ['adulti', 'ragazzi'])) {
        throw new Exception('Invalid category');
    }

    // Percorso assoluto per evitare problemi
    $baseDir = __DIR__ . '/../lib/corsi';
    $jsonFile = $baseDir . "/{$category}/corsi.json";
    
    logDebug("Target file: $jsonFile");
    logDebug("Base dir exists: " . (is_dir($baseDir) ? 'YES' : 'NO'));
    logDebug("Category dir exists: " . (is_dir(dirname($jsonFile)) ? 'YES' : 'NO'));
    logDebug("File exists: " . (file_exists($jsonFile) ? 'YES' : 'NO'));
    logDebug("File writable: " . (file_exists($jsonFile) ? (is_writable($jsonFile) ? 'YES' : 'NO') : 'N/A'));
    logDebug("Dir writable: " . (is_writable(dirname($jsonFile)) ? 'YES' : 'NO'));

    // Crea directory se non esiste
    if (!is_dir(dirname($jsonFile))) {
        logDebug("Creating directory: " . dirname($jsonFile));
        if (!mkdir(dirname($jsonFile), 0755, true)) {
            throw new Exception('Cannot create directory');
        }
    }

    // Prepara dati
    $saveData = [
        'corsi' => $courses,
        'lastUpdated' => date('c'),
        'totalCourses' => count($courses)
    ];

    $jsonContent = json_encode($saveData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    logDebug("JSON encode result: " . ($jsonContent !== false ? 'SUCCESS' : 'FAILED'));
    
    if ($jsonContent === false) {
        throw new Exception('JSON encode failed');
    }

    
    // Salva
    $writeResult = file_put_contents($jsonFile, $jsonContent, LOCK_EX);
    logDebug("Write result: " . ($writeResult !== false ? "SUCCESS ($writeResult bytes)" : 'FAILED'));
    $lastError = error_get_last();
    logDebug("Error details: " . ($lastError['message'] ?? 'none'));
    
    if ($writeResult === false) {
        throw new Exception('Cannot write file: ' . ($lastError['message'] ?? 'Unknown error'));
    }

    // Verifica
    if (!file_exists($jsonFile)) {
        throw new Exception('File not created');
    }
    
    $verifyContent = file_get_contents($jsonFile);
    logDebug("File size after save: " . strlen($verifyContent));

    echo json_encode([
        'success' => true,
        'message' => 'Courses saved successfully',
        'category' => $category,
        'total_courses' => count($courses),
        'file_path' => $jsonFile,
        'file_size' => strlen($verifyContent),
        'timestamp' => date('c')
    ]);

} catch (Exception $e) {
    logDebug("ERROR: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug_info' => [
            'method' => $_SERVER['REQUEST_METHOD'],
            'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
            'content_length' => $_SERVER['CONTENT_LENGTH'] ?? 'not set'
        ]
    ]);
} finally {
    // Assicura che l'output sia pulito
    ob_end_flush();
}
?>
