const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Ruta al archivo de credenciales
const credentialsPath = path.join(__dirname, 'credentials.json');
// ID de la hoja de Google Sheets
const SPREADSHEET_ID = '11VzMhDfuD0pk7xs7wGDMSv5mpdyF5RJSjATqVbFfq3Y';

async function testSheets() {
  console.log('Iniciando prueba de conexión a Google Sheets...');
  
  try {
    // Verificar si el archivo de credenciales existe
    if (!fs.existsSync(credentialsPath)) {
      console.error(`Error: No se encontró el archivo de credenciales en ${credentialsPath}`);
      return;
    }
    
    console.log('Archivo de credenciales encontrado.');
    
    // Cargar las credenciales
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    console.log('Credenciales cargadas correctamente.');
    console.log('Email de la cuenta de servicio:', credentials.client_email);
    
    // Inicializar el cliente JWT con las credenciales
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    console.log('Cliente JWT inicializado, intentando autenticar...');
    
    // Autenticar
    await auth.authorize();
    console.log('Autenticación exitosa!');
    
    // Crear cliente de Google Sheets
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('Cliente de Google Sheets creado.');
    
    // Verificar acceso a la hoja de cálculo
    console.log(`Verificando acceso a la hoja de cálculo (ID: ${SPREADSHEET_ID})...`);
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    console.log(`¡Conexión exitosa a la hoja "${response.data.properties.title}"!`);
    
    // Añadir una fila de prueba
    console.log('Intentando añadir una fila de prueba...');
    const timestamp = new Date().toLocaleString();
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Form Responses 1!A:C',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [
          [timestamp, 'TEST-PLACA', 'TEST-CEDULA']
        ],
      },
    });
    
    console.log('Fila añadida correctamente en la posición:', appendResponse.data.updates.updatedRange);
    console.log('La integración con Google Sheets está funcionando correctamente!');
    
  } catch (error) {
    console.error('Error durante la prueba:');
    console.error(error);
  }
}

testSheets();
