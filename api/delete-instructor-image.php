<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Leggi il JSON dal body della richiesta
    $input = json_decode(file_get_contents('php://input'), true);
    
    $filename = $input['filename'] ?? '';
    
    if (empty($filename)) {
        throw new Exception('Nome file mancante');
    }

    // Percorso completo del file
    $targetDir = __DIR__ . '/../img/insegnanti/';
    $filePath = $targetDir . $filename;

    // Verifica che il file esista
    if (!file_exists($filePath)) {
        throw new Exception('File non trovato');
    }

    // Verifica che sia nella directory consentita (security check)
    $realTargetDir = realpath($targetDir);
    $realFilePath = realpath($filePath);
    
    if ($realFilePath === false || strpos($realFilePath, $realTargetDir) !== 0) {
        throw new Exception('Accesso non autorizzato');
    }

    // Elimina il file
    if (!unlink($filePath)) {
        throw new Exception('Errore nell\'eliminazione del file');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Immagine eliminata con successo'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
