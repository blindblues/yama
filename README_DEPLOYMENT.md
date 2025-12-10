# Guida al Deployment Online - Yamakasi Fight Academy

## Requisiti del Server

Per il funzionamento completo del sistema di upload immagini online, il server deve avere:

### PHP
- Versione PHP 7.4 o superiore
- Estensioni PHP richieste:
  - `fileinfo` (per verificare i tipi di file)
  - `json` (per le risposte API)
  - `mbstring` (per la gestione dei nomi file)

### Server Web
- Apache (consigliato) o Nginx
- Modulo rewrite abilitato (Apache)
- Supporto per file .htaccess (Apache)

### Permessi
- Scrittura abilitata nelle cartelle:
  - `img/corsi/adulti/`
  - `img/corsi/ragazzi/`
  - `api/` (per il file di log)

## Configurazione Server

### Apache

1. **Assicurati che il modulo rewrite sia attivo:**
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

2. **Configura i permessi delle cartelle:**
   ```bash
   chmod 755 img/corsi/
   chmod 755 img/corsi/adulti/
   chmod 755 img/corsi/ragazzi/
   chmod 755 api/
   
   # Imposta il proprietario corretto (sostituisci con il tuo utente web)
   chown -R www-data:www-data img/corsi/
   chown www-data:www-data api/
   ```

3. **Verifica la configurazione PHP:**
   - Crea un file `info.php` con `<?php phpinfo(); ?>`
   - Verifica che le estensioni necessarie siano caricate
   - Rimuovi il file dopo il controllo

### Nginx

Se usi Nginx, aggiungi questa configurazione al tuo server block:

```nginx
location /api/ {
    try_files $uri $uri/ /api/upload-image.php;
    
    # Header CORS
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
    
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With';
        add_header 'Content-Length' 0;
        add_header 'Content-Type' 'text/plain';
        return 204;
    }
}

location ~* \.(jpg|jpeg|png|gif|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Upload dei File

1. **Carica tutti i file del sito sul server**
2. **Mantieni la struttura delle cartelle**
3. **Verifica che i seguenti file siano presenti:**
   - `api/upload-image.php`
   - `api/.htaccess`
   - `console/console.html`
   - `console/console.js`
   - `console/console.css`

## Test del Sistema

### 1. Test Locale
Apri `console/console.html` nel browser e verifica che:
- La console si carichi correttamente
- Il form per aggiungere corsi funzioni
- L'upload di immagini mostri l'anteprima

### 2. Test Online
Una volta caricato sul server:

1. **Verifica l'endpoint API:**
   - Visita `https://tuodominio.com/api/upload-image.php`
   - Dovresti vedere un errore JSON (è normale, serve solo a verificare che funzioni)

2. **Test dell'upload:**
   - Apri la console online
   - Prova a creare un nuovo corso con un'immagine
   - Verifica che l'immagine venga salvata nella cartella corretta

3. **Verifica i log:**
   - Controlla il file `api/upload_errors.log` per eventuali errori

## Risoluzione Problemi Comuni

### Errore 404 su `/api/upload-image`
- Verifica che il modulo rewrite sia attivo
- Controlla che il file `.htaccess` sia presente nella cartella `api/`
- Su Nginx, verifica la configurazione location

### Errore 500 - Internal Server Error
- Controlla i log degli errori del server
- Verifica i permessi delle cartelle
- Assicurati che PHP abbia le estensioni necessarie

### Upload fallisce
- Verifica che la cartella di destinazione esista e sia scrivibile
- Controlla la dimensione massima del file (5MB)
- Verifica il tipo di file (solo immagini)

### Immagini non visibili
- Controlla i permessi dei file caricati
- Verifica il percorso salvato nel database
- Assicurati che il server serva i file statici

## Sicurezza

### Raccomandazioni
1. **Limita la dimensione massima dei file** nel php.ini:
   ```ini
   upload_max_filesize = 5M
   post_max_size = 5M
   ```

2. **Proteggi la cartella api** se non usata pubblicamente:
   ```apache
   <Directory "/path/to/api">
       Order Deny,Allow
       Deny from all
       Allow from 127.0.0.1
       Allow from tuo.ip
   </Directory>
   ```

3. **Monitora i log** regolarmente per attività sospette

4. **Backup regolare** delle immagini caricate

## Manutenzione

### Pulizia dei log
Il file `api/upload_errors.log` può crescere nel tempo. Per pulirlo:
```bash
# Svuota il file
> api/upload_errors.log

# Oppure ruota i log
mv api/upload_errors.log api/upload_errors.log.old
touch api/upload_errors.log
```

### Backup delle immagini
Crea un backup regolare delle cartelle delle immagini:
```bash
tar -czf yamakasi_images_backup_$(date +%Y%m%d).tar.gz img/corsi/
```

## Supporto

Per problemi tecnici:
1. Controlla prima i log degli errori
2. Verifica la configurazione del server
3. Assicurati di aver seguito tutti i passaggi di questa guida

---

**Nota:** Questa guida assume una configurazione standard di hosting condiviso o VPS. Se usi un provider specifico, potrebbero essere necessarie configurazioni aggiuntive.
