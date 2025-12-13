<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Verifica se è stato caricato un file
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Errore nel caricamento dell\'immagine');
    }

    $file = $_FILES['image'];
    $instructorId = $_POST['instructor_id'] ?? '';
    
    if (empty($instructorId)) {
        throw new Exception('ID insegnante mancante');
    }

    // Verifica estensione del file
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($fileExtension, $allowedExtensions)) {
        throw new Exception('Estensione file non consentita. Usa: jpg, jpeg, png, gif, webp');
    }

    // Verifica dimensione file (max 5MB)
    $maxFileSize = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $maxFileSize) {
        throw new Exception('File troppo grande. Dimensione massima: 5MB');
    }

    // Percorso di destinazione
    $targetDir = __DIR__ . '/../img/insegnanti/';
    
    // Crea la directory se non esiste
    if (!file_exists($targetDir)) {
        if (!mkdir($targetDir, 0755, true)) {
            throw new Exception('Impossibile creare la directory di destinazione');
        }
    }

    // Nome file basato sull'ID insegnante
    $fileName = $instructorId . '.' . $fileExtension;
    $targetPath = $targetDir . $fileName;

    // Elimina file esistente con lo stesso nome (se presente)
    if (file_exists($targetPath)) {
        unlink($targetPath);
    }

    // Sposta il file caricato
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new Exception('Errore nel salvataggio del file');
    }

    // Ritorna il percorso relativo per il web
    $webPath = '../img/insegnanti/' . $fileName;

    echo json_encode([
        'success' => true,
        'message' => 'Immagine salvata con successo',
        'path' => $webPath,
        'filename' => $fileName
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
