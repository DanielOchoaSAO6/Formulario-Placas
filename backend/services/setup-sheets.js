const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');

const SPREADSHEET_ID = '11VzMhDfuD0pk7xs7wGDMSv5mpdyF5RJSjATqVbFfq3Y';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function main() {
  try {
    console.log('Iniciando configuración de Google Sheets...');
    
    // Verificar si el archivo de credenciales existe
    const credentialsPath = path.join(__dirname, 'credentials.json');
    if (!fs.existsSync(credentialsPath)) {
      console.error(`Error: No se encontró el archivo de credenciales en ${credentialsPath}`);
      console.log('Por favor, asegúrate de tener el archivo credentials.json en la carpeta services/');
      return;
    }
    
    console.log('Archivo de credenciales encontrado. Autenticando...');
    
    // Autenticar con las credenciales
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: SCOPES,
    });
    
    const client = await auth.getClient();
    console.log('Autenticación exitosa!');
    
    // Crear cliente de Google Sheets
    const sheets = google.sheets({ version: 'v4', auth: client });
    
    // Verificar acceso a la hoja de cálculo
    console.log(`Verificando acceso a la hoja de cálculo (ID: ${SPREADSHEET_ID})...`);
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    console.log(`¡Conexión exitosa a la hoja "${response.data.properties.title}"!`);
    console.log('Hojas disponibles:');
    response.data.sheets.forEach(sheet => {
      console.log(`- ${sheet.properties.title}`);
    });
    
    // Verificar permisos de escritura intentando leer la hoja Form Responses 1
    console.log('\nVerificando permisos de lectura/escritura...');
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Form Responses 1!A1:C1',
    });
    
    console.log('Permisos de lectura verificados correctamente.');
    
    // Añadir una fila de prueba para verificar permisos de escritura
    const timestamp = new Date().toLocaleString();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Form Responses 1!A:C',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [
          [timestamp, 'TEST-PLACA', 'TEST-CEDULA']
        ],
      },
    });
    
    console.log('Permisos de escritura verificados correctamente.');
    console.log('Se ha añadido una fila de prueba a la hoja.');
    console.log('\n¡Configuración completada con éxito!');
    console.log('La integración con Google Sheets está lista para ser utilizada.');
    
  } catch (error) {
    console.error('Error durante la configuración:', error.message);
    console.error('Error completo:', error);
    
    if (error.code === 403) {
      console.error('\nError de permisos: No tienes acceso a esta hoja de cálculo.');
      console.error('Asegúrate de que:');
      console.error('1. La cuenta de servicio tiene permisos de edición en la hoja de cálculo');
      console.error('2. Has compartido la hoja con la dirección de correo de la cuenta de servicio:');
      console.error('   placas-patios-app@sublime-shift-461915-p8.iam.gserviceaccount.com');
    } else if (error.code === 404) {
      console.error('\nError: No se encontró la hoja de cálculo especificada.');
      console.error('Verifica que el ID de la hoja sea correcto.');
    }
  }
}

main();
