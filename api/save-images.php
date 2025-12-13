<?php
// API endpoint per salvare il file images.json
// Questo file deve essere messo su un server web con PHP

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
    $logFile = __DIR__ . '/save_images_errors.log';
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
    if (!isset($data['images'])) {
        throw new Exception('Dati incompleti: images è richiesto');
    }

    // Percorso del file JSON
    $jsonFile = 'C:/Users/Blues/Documents/Programmazione/Programmi/Yamakasi Verona/Sito Yamakasi/lib/corsi/images/images.json';

    // Verifica che la directory esista
    $jsonDir = dirname($jsonFile);
    if (!is_dir($jsonDir)) {
        if (!mkdir($jsonDir, 0755, true)) {
            logError('Impossibile creare directory', ['directory' => $jsonDir]);
            throw new Exception('Impossibile creare la directory delle immagini');
        }
    }

    // Prepara i dati da salvare
    $saveData = [
        'images' => $data['images'],
        'lastUpdated' => $data['lastUpdated'] ?? date('c'),
        'totalImages' => $data['totalImages'] ?? count($data['images'])
    ];

    // Converti in JSON formattato
    $jsonContent = json_encode($saveData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($jsonContent === false) {
        throw new Exception('Errore nella codifica JSON: ' . json_last_error_msg());
    }

    // Salva il file
    if (file_put_contents($jsonFile, $jsonContent, LOCK_EX) === false) {
        throw new Exception('Impossibile salvare il file JSON');
    }

    // Log successo
    logError('Immagini salvate con successo', [
        'total_images' => count($data['images']),
        'file' => $jsonFile
    ]);

    // Debug: Aggiungi output visibile
    error_log("DEBUG: Immagini salvate con successo - File: $jsonFile, Immagini: " . count($data['images']));

    // Rispondi con successo
    echo json_encode([
        'success' => true,
        'message' => 'Immagini salvate con successo',
        'total_images' => count($data['images']),
        'file_saved' => $jsonFile,
        'timestamp' => date('c')
    ]);

} catch (Exception $e) {
    // Log errore
    logError('Errore salvataggio immagini: ' . $e->getMessage(), [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    // Rispondi con errore
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'error_code' => 'SAVE_IMAGES_ERROR'
    ]);
}
?>
