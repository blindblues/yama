<?php
// API endpoint per salvare i corsi nei file JSON
// Questo file deve essere messo su un server web con PHP

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

// Imposta gli header CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Gestisci le richieste OPTIONS per CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Funzione per logging errori
function logError($message, $data = []) {
    $logFile = __DIR__ . '/save_courses_errors.log';
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[{$timestamp}] {$message}";
    if (!empty($data)) {
        $logEntry .= " | Data: " . json_encode($data);
    }
    $logEntry .= "\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

try {
    // Verifica che sia una richiesta POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Metodo non consentito');
    }

    // Leggi il body della richiesta
    $input = file_get_contents('php://input');
    if (empty($input)) {
        throw new Exception('Dati mancanti');
    }

    // Decodifica il JSON
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON non valido: ' . json_last_error_msg());
    }

    // Verifica i dati necessari
    if (!isset($data['category']) || !isset($data['courses'])) {
        throw new Exception('Dati incompleti: category e courses sono richiesti');
    }

    $category = $data['category'];
    $courses = $data['courses'];

    // Verifica la categoria
    if (!in_array($category, ['adulti', 'ragazzi'])) {
        logError('Categoria non valida', ['category' => $category]);
        throw new Exception('Categoria non valida');
    }

    // Verifica che i corsi siano un array
    if (!is_array($courses)) {
        throw new Exception('I corsi devono essere un array');
    }

    // Percorso del file JSON
    $jsonFile = __DIR__ . "/../lib/corsi/{$category}/corsi.json";
    
    // Debug logging
    error_log("DEBUG: Tentativo salvataggio file: " . $jsonFile);
    error_log("DEBUG: Directory esiste: " . (is_dir(dirname($jsonFile)) ? 'Sì' : 'No'));
    error_log("DEBUG: File esiste: " . (file_exists($jsonFile) ? 'Sì' : 'No'));

    // Verifica che la directory esista
    $jsonDir = dirname($jsonFile);
    if (!is_dir($jsonDir)) {
        if (!mkdir($jsonDir, 0755, true)) {
            logError('Impossibile creare directory', ['directory' => $jsonDir]);
            throw new Exception('Impossibile creare la directory dei corsi');
        }
    }

    // Prepara i dati da salvare
    $saveData = [
        'corsi' => $courses,
        'lastUpdated' => date('c'),
        'totalCourses' => count($courses)
    ];

    // Converti in JSON formattato
    $jsonContent = json_encode($saveData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($jsonContent === false) {
        throw new Exception('Errore nella codifica JSON: ' . json_last_error_msg());
    }

    // Backup del file esistente
    if (file_exists($jsonFile)) {
        $backupFile = $jsonFile . '.backup.' . date('Y-m-d_H-i-s');
        if (!copy($jsonFile, $backupFile)) {
            logError('Impossibile creare backup', ['file' => $jsonFile, 'backup' => $backupFile]);
        }
    }

    // Salva il file
    if (file_put_contents($jsonFile, $jsonContent, LOCK_EX) === false) {
        throw new Exception('Impossibile salvare il file JSON');
    }

    // Log successo
    logError('Corsi salvati con successo', [
        'category' => $category,
        'total_courses' => count($courses),
        'file' => $jsonFile
    ]);

    // Debug: Aggiungi output visibile
    error_log("DEBUG: Corsi salvati con successo - File: $jsonFile, Corsi: " . count($courses));

    // Rispondi con successo
    echo json_encode([
        'success' => true,
        'message' => 'Corsi salvati con successo',
        'category' => $category,
        'total_courses' => count($courses),
        'file_saved' => $jsonFile,
        'timestamp' => date('c')
    ]);

} catch (Exception $e) {
    // Log errore
    logError('Errore salvataggio corsi: ' . $e->getMessage(), [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    // Rispondi con errore
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'error_code' => 'SAVE_COURSES_ERROR'
    ]);
} finally {
    // Assicura che l'output sia pulito
    ob_end_flush();
}
?>
