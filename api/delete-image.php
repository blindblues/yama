<?php
// API endpoint per eliminare le immagini dei corsi
// Questo file deve essere messo su un server web con PHP

// Imposta gli header CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Gestisci le richieste OPTIONS per CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Funzione per logging errori
function logError($message, $data = []) {
    $logFile = __DIR__ . '/delete_image_errors.log';
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[{$timestamp}] {$message}";
    if (!empty($data)) {
        $logEntry .= " | Data: " . json_encode($data);
    }
    $logEntry .= "\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

try {
    // Verifica che sia una richiesta POST o DELETE
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        throw new Exception('Metodo non consentito');
    }

    // Leggi il body della richiesta per POST o usa $_POST per DELETE
    $input = file_get_contents('php://input');
    $data = [];
    
    if (!empty($input)) {
        $data = json_decode($input, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('JSON non valido: ' . json_last_error_msg());
        }
    }
    
    // Unisci con $_POST per compatibilità
    $data = array_merge($data, $_POST);

    // Verifica i dati necessari
    if (!isset($data['imagePath']) && !isset($data['courseId'])) {
        throw new Exception('Dati incompleti: imagePath o courseId è richiesto');
    }

    $imagePath = $data['imagePath'] ?? '';
    $courseId = $data['courseId'] ?? '';

    // Se abbiamo solo courseId, dobbiamo leggere l'immagine dal file images.json
    if (empty($imagePath) && !empty($courseId)) {
        $imagesJsonFile = 'C:/Users/Blues/Documents/Programmazione/Programmi/Yamakasi Verona/Sito Yamakasi/lib/corsi/images/images.json';
        
        if (file_exists($imagesJsonFile)) {
            $imagesData = json_decode(file_get_contents($imagesJsonFile), true);
            if (isset($imagesData['images'][$courseId])) {
                $imagePath = $imagesData['images'][$courseId]['imagePath'] ?? '';
            }
        }
    }

    if (empty($imagePath)) {
        throw new Exception('Nessun percorso immagine specificato o trovato');
    }

    // Converti percorso relativo in assoluto
    $baseDir = __DIR__ . '/../';
    $fullImagePath = $baseDir . $imagePath;

    // Verifica che il file esista
    if (!file_exists($fullImagePath)) {
        logError('File immagine non trovato', [
            'imagePath' => $imagePath,
            'fullPath' => $fullImagePath,
            'courseId' => $courseId
        ]);
        throw new Exception('File immagine non trovato');
    }

    // Verifica che sia davvero un file immagine
    $imageInfo = getimagesize($fullImagePath);
    if ($imageInfo === false) {
        logError('File non è un\'immagine valida', [
            'imagePath' => $imagePath,
            'fullPath' => $fullImagePath
        ]);
        throw new Exception('File non è un\'immagine valida');
    }

    // Elimina il file
    if (!unlink($fullImagePath)) {
        logError('Impossibile eliminare il file immagine', [
            'imagePath' => $imagePath,
            'fullPath' => $fullImagePath
        ]);
        throw new Exception('Impossibile eliminare il file immagine');
    }

    // Se abbiamo courseId, rimuovi anche l'entry da images.json
    if (!empty($courseId)) {
        $imagesJsonFile = 'C:/Users/Blues/Documents/Programmazione/Programmi/Yamakasi Verona/Sito Yamakasi/lib/corsi/images/images.json';
        
        if (file_exists($imagesJsonFile)) {
            $imagesData = json_decode(file_get_contents($imagesJsonFile), true);
            
            if (isset($imagesData['images'][$courseId])) {
                unset($imagesData['images'][$courseId]);
                $imagesData['lastUpdated'] = date('c');
                $imagesData['totalImages'] = count($imagesData['images']);
                
                // Salva il file images.json aggiornato
                if (file_put_contents($imagesJsonFile, json_encode($imagesData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX) === false) {
                    logError('Impossibile aggiornare images.json', [
                        'courseId' => $courseId,
                        'imagePath' => $imagePath
                    ]);
                    // Non lanciare errore, il file è già stato eliminato
                } else {
                    logError('Images.json aggiornato con successo', [
                        'courseId' => $courseId,
                        'remainingImages' => $imagesData['totalImages']
                    ]);
                }
            }
        }
    }

    // Log successo
    logError('Immagine eliminata con successo', [
        'imagePath' => $imagePath,
        'fullPath' => $fullImagePath,
        'courseId' => $courseId
    ]);

    // Rispondi con successo
    echo json_encode([
        'success' => true,
        'message' => 'Immagine eliminata con successo',
        'imagePath' => $imagePath,
        'courseId' => $courseId,
        'timestamp' => date('c')
    ]);

} catch (Exception $e) {
    // Log errore
    logError('Errore eliminazione immagine: ' . $e->getMessage(), [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'data' => $data ?? []
    ]);
    
    // Rispondi con errore
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'error_code' => 'DELETE_IMAGE_ERROR'
    ]);
}
?>
