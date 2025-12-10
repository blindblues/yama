<?php
// API endpoint per l'upload delle immagini
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

// Configurazione
$uploadDir = __DIR__ . '/../img/corsi/';
$maxFileSize = 5 * 1024 * 1024; // 5MB
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// Funzione per logging errori
function logError($message, $data = []) {
    $logFile = __DIR__ . '/upload_errors.log';
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

    // Verifica CSRF token se presente (per produzione)
    if (isset($_POST['csrf_token']) && function_exists('verify_csrf_token')) {
        if (!verify_csrf_token($_POST['csrf_token'])) {
            throw new Exception('Token di sicurezza non valido');
        }
    }

    // Verifica che ci sia un file caricato
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        $errorCode = $_FILES['image']['error'] ?? 'unknown';
        $errorMessage = 'Nessun file caricato o errore durante il caricamento';
        
        // Log dettagliato dell'errore
        logError($errorMessage, [
            'error_code' => $errorCode,
            'file_data' => $_FILES ?? []
        ]);
        
        // Messaggio specifico per l'utente
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new Exception('File troppo grande. Dimensione massima: 5MB');
            case UPLOAD_ERR_PARTIAL:
                throw new Exception('Caricamento del file interrotto');
            case UPLOAD_ERR_NO_FILE:
                throw new Exception('Nessun file selezionato');
            default:
                throw new Exception($errorMessage);
        }
    }

    $file = $_FILES['image'];
    $category = $_POST['category'] ?? 'adulti';
    $imagePath = $_POST['imagePath'] ?? '';

    // Verifica la categoria
    if (!in_array($category, ['adulti', 'ragazzi'])) {
        logError('Categoria non valida', ['category' => $category]);
        throw new Exception('Categoria non valida');
    }

    // Verifica il tipo di file
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $detectedType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($detectedType, $allowedTypes)) {
        logError('Tipo di file non consentito', [
            'detected_type' => $detectedType,
            'allowed_types' => $allowedTypes
        ]);
        throw new Exception('Tipo di file non consentito. Tipi permessi: ' . implode(', ', $allowedTypes));
    }

    // Verifica l'estensione del file
    $fileInfo = pathinfo($file['name']);
    $extension = strtolower($fileInfo['extension'] ?? '');
    
    if (!in_array($extension, $allowedExtensions)) {
        logError('Estensione file non consentita', [
            'extension' => $extension,
            'allowed_extensions' => $allowedExtensions
        ]);
        throw new Exception('Estensione del file non consentita');
    }

    // Verifica la dimensione del file
    if ($file['size'] > $maxFileSize) {
        logError('File troppo grande', [
            'size' => $file['size'],
            'max_size' => $maxFileSize
        ]);
        throw new Exception('File troppo grande. Dimensione massima: 5MB');
    }

    // Verifica che il file sia un'immagine valida
    if (!getimagesize($file['tmp_name'])) {
        logError('File immagine non valido', ['file' => $file['name']]);
        throw new Exception('Il file non è un\'immagine valida');
    }

    // Crea la directory se non esiste
    $targetDir = $uploadDir . $category;
    if (!is_dir($targetDir)) {
        if (!mkdir($targetDir, 0755, true)) {
            logError('Impossibile creare directory', ['target_dir' => $targetDir]);
            throw new Exception('Impossibile creare la directory di destinazione');
        }
    }

    // Estrai il nome file dal path o genera uno nuovo
    if (!empty($imagePath)) {
        // Usa il path specificato dal client
        $pathParts = explode('/', $imagePath);
        $fileName = end($pathParts);
    } else {
        // Genera un nome file sicuro
        $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9.-]/', '_', $fileInfo['filename']) . '.' . $extension;
    }

    // Verifica che il nome file sia sicuro
    $fileName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $fileName);
    $targetPath = $targetDir . '/' . $fileName;

    // Verifica che il file non esista già
    if (file_exists($targetPath)) {
        $counter = 1;
        $baseName = pathinfo($fileName, PATHINFO_FILENAME);
        $extension = pathinfo($fileName, PATHINFO_EXTENSION);
        
        do {
            $newFileName = $baseName . '_' . $counter . '.' . $extension;
            $targetPath = $targetDir . '/' . $newFileName;
            $counter++;
        } while (file_exists($targetPath));
        
        $fileName = $newFileName;
        $targetPath = $targetDir . '/' . $fileName;
    }

    // Sposta il file nella directory di destinazione
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        logError('Impossibile salvare il file', [
            'temp_name' => $file['tmp_name'],
            'target_path' => $targetPath
        ]);
        throw new Exception('Impossibile salvare il file');
    }

    // Imposta i permessi corretti
    chmod($targetPath, 0644);

    // Log successo
    logError('Upload completato con successo', [
        'file_name' => $fileName,
        'category' => $category,
        'size' => $file['size']
    ]);

    // Rispondi con successo
    $relativePath = 'img/corsi/' . $category . '/' . $fileName;
    echo json_encode([
        'success' => true,
        'path' => $relativePath,
        'full_path' => $targetPath,
        'file_name' => $fileName,
        'size' => $file['size'],
        'type' => $detectedType,
        'message' => 'Immagine salvata con successo'
    ]);

} catch (Exception $e) {
    // Log errore
    logError('Errore upload: ' . $e->getMessage(), [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    // Rispondi con errore
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'error_code' => 'UPLOAD_ERROR'
    ]);
}
?>
