const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const credentialsTemplate = {
  "type": "service_account",
  "project_id": "sublime-shift-461915-p8",
  "private_key_id": "",
  "private_key": "",
  "client_email": "placas-patios-app@sublime-shift-461915-p8.iam.gserviceaccount.com",
  "client_id": "",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/placas-patios-app%40sublime-shift-461915-p8.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

console.log('=== Generador de archivo de credenciales para Google Sheets ===');
console.log('Este script te ayudará a crear un archivo de credenciales válido para tu cuenta de servicio.');
console.log('Necesitarás tener a mano la información de tu cuenta de servicio de Google Cloud.');
console.log('');

rl.question('Ingresa el private_key_id: ', (privateKeyId) => {
  credentialsTemplate.private_key_id = privateKeyId;
  
  console.log('\nAhora ingresa la private_key completa.');
  console.log('Debe comenzar con "-----BEGIN PRIVATE KEY-----" y terminar con "-----END PRIVATE KEY-----"');
  console.log('Puedes copiar y pegar el contenido completo:');
  
  rl.question('', (privateKey) => {
    credentialsTemplate.private_key = privateKey.replace(/\\n/g, '\n');
    
    rl.question('\nIngresa el client_id: ', (clientId) => {
      credentialsTemplate.client_id = clientId;
      
      const credentialsPath = path.join(__dirname, 'credentials.json');
      fs.writeFileSync(credentialsPath, JSON.stringify(credentialsTemplate, null, 2));
      
      console.log(`\n¡Archivo de credenciales generado exitosamente en ${credentialsPath}!`);
      console.log('Ahora puedes ejecutar el script setup-sheets.js para verificar la conexión.');
      
      rl.close();
    });
  });
});
