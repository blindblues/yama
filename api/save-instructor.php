<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestisci preflight request OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Leggi il JSON dal body
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Dati JSON non validi');
    }

    // Validazione campi richiesti
    $required_fields = ['id', 'name', 'discipline', 'biography'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Campo '$field' obbligatorio");
        }
    }

    // Percorso del file JSON
    $json_file = __DIR__ . '/../lib/insegnanti/insegnanti.json';
    
    if (!file_exists($json_file)) {
        throw new Exception('File insegnanti.json non trovato');
    }

    // Leggi il file JSON esistente
    $json_data = file_get_contents($json_file);
    $data = json_decode($json_data, true);
    
    if (!$data || !isset($data['insegnanti'])) {
        throw new Exception('Formato file JSON non valido');
    }

    // Trova l'indice dell'insegnante da modificare
    $instructor_index = -1;
    foreach ($data['insegnanti'] as $index => $instructor) {
        if ($instructor['id'] === $input['id']) {
            $instructor_index = $index;
            break;
        }
    }

    if ($instructor_index === -1) {
        throw new Exception('Insegnante non trovato');
    }

    // Prepara i dati aggiornati
    $updated_instructor = [
        'id' => $input['id'],
        'name' => trim($input['name']),
        'discipline' => trim($input['discipline']),
        'biography' => trim($input['biography']),
        'achievementstitle' => isset($input['achievementstitle']) ? trim($input['achievementstitle']) : '',
        'achievements' => []
    ];

    // Gestisci gli achievements
    if (isset($input['achievements']) && !empty($input['achievements'])) {
        // Se è una stringa, dividila per virgole
        if (is_string($input['achievements'])) {
            $achievements_array = array_map('trim', explode(',', $input['achievements']));
            $updated_instructor['achievements'] = array_filter($achievements_array, function($item) {
                return !empty($item);
            });
        } else if (is_array($input['achievements'])) {
            $updated_instructor['achievements'] = array_map('trim', $input['achievements']);
        }
    }

    // Mantieni l'immagine esistente se non viene fornita una nuova
    if (isset($input['image']) && !empty($input['image'])) {
        $updated_instructor['image'] = $input['image'];
    } else {
        // Mantieni l'immagine esistente
        $updated_instructor['image'] = $data['insegnanti'][$instructor_index]['image'];
    }

    // Aggiorna i dati dell'insegnante
    $data['insegnanti'][$instructor_index] = $updated_instructor;

    // Aggiorna timestamp e totale
    $data['lastUpdated'] = date('c');
    $data['totalInstructors'] = count($data['insegnanti']);

    // Salva il file JSON
    $json_output = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if (file_put_contents($json_file, $json_output) === false) {
        throw new Exception('Errore durante il salvataggio del file');
    }

    // Imposta i permessi corretti
    chmod($json_file, 0644);

    // Risposta di successo
    echo json_encode([
        'success' => true,
        'message' => 'Insegnante aggiornato con successo',
        'data' => $updated_instructor
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
