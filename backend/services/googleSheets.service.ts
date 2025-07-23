import { google } from 'googleapis';
import { format } from 'date-fns';
import * as fs from 'fs';
import * as path from 'path';

const GOOGLE_SHEETS_CONFIG = {
  spreadsheetId: '11VzMhDfuD0pk7xs7wGDMSv5mpdyF5RJSjATqVbFfq3Y', 
  sheetName: 'Form Responses 1',
  searchSheetName: 'Busquedas',
  credentialsPath: path.resolve(__dirname, '../../services/credentials.json')
};

/**
 * Servicio para interactuar con Google Sheets
 */
export class GoogleSheetsService {
  private sheets: any;
  private initialized: boolean = false;

  constructor() {
    try {
      if (!fs.existsSync(GOOGLE_SHEETS_CONFIG.credentialsPath)) {
        throw new Error(`Archivo de credenciales no encontrado en: ${GOOGLE_SHEETS_CONFIG.credentialsPath}`);
      }

      const credentials = JSON.parse(fs.readFileSync(GOOGLE_SHEETS_CONFIG.credentialsPath, 'utf8'));
      
      const auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.initialized = true;
      console.log('Google Sheets service initialized successfully with real credentials');
    } catch (error) {
      console.error('Error initializing Google Sheets service:', error);
      this.sheets = null;
    }
  }

  /**
   * Añade un registro de vehículo a la hoja de Google Sheets
   * @param placa Placa del vehículo
   * @param cedula Cédula del conductor (opcional)
   * @returns Promise<boolean> True si se guardó correctamente
   */
  async addVehicleRecord(placa: string, cedula: string | null = null): Promise<boolean> {
    try {
      if (!this.sheets) {
        console.log('Simulando guardado en Google Sheets (modo desarrollo)');
        console.log(`Timestamp: ${format(new Date(), 'M/d/yyyy H:mm:ss')}`);
        console.log(`Placa: ${placa}`);
        console.log(`Cédula: ${cedula}`);
        return true;
      }

      const timestamp = format(new Date(), 'M/d/yyyy H:mm:ss');
      const values = [
        [timestamp, placa.toUpperCase(), cedula || 'SIN CONDUCTOR']
      ];

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: `${GOOGLE_SHEETS_CONFIG.sheetName}!A:C`,
      });
      
      const rows = response.data.values || [];
      const nextRow = rows.length + 1;
      
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: `${GOOGLE_SHEETS_CONFIG.sheetName}!A${nextRow}:C${nextRow}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: values,
        },
      });
      
      console.log(`Vehículo ${placa} guardado en Google Sheets en la fila ${nextRow}`);
      return true;
    } catch (error) {
      console.error('Error al guardar en Google Sheets:', error);
      return false;
    }
  }
  
  /**
   * Añade un registro de verificación de vehículo a la hoja de Busquedas en Google Sheets
   * @param placa Placa del vehículo
   * @param encontrado Si el vehículo fue encontrado
   * @param userId ID del usuario que realizó la búsqueda
   * @param startTime Hora de inicio de la verificación
   * @param endTime Hora de finalización de la verificación
   * @returns Promise<boolean> True si se guardó correctamente
   */
  async addVehicleVerificationLog(
    placa: string,
    encontrado: boolean,
    userId: string | null,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    try {
      if (!this.sheets) {
        console.log('Simulando guardado de log en Google Sheets (modo desarrollo)');
        console.log(`Placa: ${placa}`);
        console.log(`Encontrado: ${encontrado}`);
        console.log(`Usuario: ${userId}`);
        console.log(`Inicio: ${startTime.toISOString()}`);
        console.log(`Fin: ${endTime.toISOString()}`);
        console.log(`Creado: ${new Date().toISOString()}`);
        return true;
      }

      // Obtener todas las filas existentes para determinar la siguiente fila
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: `${GOOGLE_SHEETS_CONFIG.searchSheetName}!A:G`,
      });
      
      const rows = response.data.values || [];
      const nextRow = rows.length + 1;
      
      // Preparar los datos para insertar
      // Columnas: Id, Placa, Encontrado, Usuario, Inicio, Fin, Creado
      const values = [
        [
          nextRow - 1, // ID (índice basado en 0)
          placa.toUpperCase(),
          encontrado ? 'SI' : 'NO',
          userId || 'N/A',
          startTime.toISOString(),
          endTime.toISOString(),
          new Date().toISOString()
        ]
      ];
      
      // Insertar los datos en la siguiente fila
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: `${GOOGLE_SHEETS_CONFIG.searchSheetName}!A${nextRow}:G${nextRow}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: values,
        },
      });
      
      console.log(`Verificación de vehículo ${placa} guardada en Google Sheets (hoja Busquedas) en la fila ${nextRow}`);
      return true;
    } catch (error) {
      console.error('Error al guardar verificación en Google Sheets:', error);
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
