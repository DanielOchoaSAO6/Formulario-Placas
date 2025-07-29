import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { useMutation, useLazyQuery } from '@apollo/client';
import { BULK_INSERT_VEHICLES, GET_VEHICLES_BY_PLACAS, UPDATE_VEHICLE_CEDULA } from '@/graphql/users';
import toast from 'react-hot-toast';
import {
  Upload,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Car,
  Building,
  MapPin,
  Briefcase,
  Tag,
  X,
  Save,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileX,
  Database,
  MoreVertical,
  Info,
  ClipboardList
} from 'lucide-react';

interface VehicleData {
  CEDULA: string;
  PLACA: string;
  Estado: string;
  'Tipo de vehiculo'?: string; // Agregar variación sin "de"
  'Tipo de vehículo'?: string; // Mantener la versión con "de"
  Origen: string;
  Nombre: string;
  Cargo: string;
  Area: string;
  _uniqueId?: string; // ID único para evitar problemas con keys duplicadas
}



interface SavedVehicle {
  id: string;
  placa: string;
  cedula: string;
  estado: string;
  tipoVehiculo: string;
  origen: string;
  nombre?: string;
  cargo: string;
  area: string;
  conductor?: {
    id: string;
    name: string;
  };
}

const ITEMS_PER_PAGE = 10;

const ExcelDataLoader = () => {
  const [data, setData] = useState<VehicleData[]>([]);
  const [filteredData, setFilteredData] = useState<VehicleData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<VehicleData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicle[]>([]);
  const [editingCedula, setEditingCedula] = useState<string | null>(null);
  const [tempCedula, setTempCedula] = useState('');
  const [newRecord, setNewRecord] = useState<VehicleData>({
    CEDULA: '',
    PLACA: '',
    Estado: 'Activo',
    'Tipo de vehículo': '',
    Origen: '',
    Nombre: '',
    Cargo: '',
    Area: ''
  });
  const [hasNewInserts, setHasNewInserts] = useState(true); // Para saber si se insertaron vehículos nuevos
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });
  const [showProgress, setShowProgress] = useState(false);

  // Función para obtener el valor del tipo de vehículo (maneja ambas variaciones)
  const getTipoVehiculo = useCallback((record: VehicleData) => {
    return record['Tipo de vehículo'] || record['Tipo de vehiculo'] || '';
  }, []);

  // Función para manejar cambios en checkboxes (optimizada)
  const handleCheckboxChange = useCallback((index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRows(prev => {
      const newSelected = new Set(prev);
      if (e.target.checked) {
        newSelected.add(index);
      } else {
        newSelected.delete(index);
      }
      return newSelected;
    });
  }, []);

  // Mutación para actualizar cédula
  const [updateVehicleCedula] = useMutation(UPDATE_VEHICLE_CEDULA, {
    onCompleted: (data) => {
      // Actualizar la lista de vehículos guardados
      setSavedVehicles(prev => 
        prev.map(vehicle => 
          vehicle.placa === data.updateVehicleCedula.placa 
            ? { ...vehicle, cedula: data.updateVehicleCedula.cedula, conductor: data.updateVehicleCedula.conductor }
            : vehicle
        )
      );
      setEditingCedula(null);
      setTempCedula('');
      toast.success(`Cédula actualizada para ${data.updateVehicleCedula.placa}`);
    },
    onError: (error) => {
      toast.error(`Error al actualizar cédula: ${error.message}`);
      setEditingCedula(null);
      setTempCedula('');
    }
  });

  // Mutación para guardar vehículos en la base de datos
  const [bulkInsertVehicles] = useMutation(BULK_INSERT_VEHICLES, {
    onCompleted: (data) => {
      setIsSaving(false);
      setHasNewInserts(data.bulkInsertVehicles.insertedCount > 0);
      
      if (data.bulkInsertVehicles.success || data.bulkInsertVehicles.insertedCount === 0) {
        // Mostrar resumen más detallado
        const insertedCount = data.bulkInsertVehicles.insertedCount;
        const updatedCount = data.bulkInsertVehicles.updatedCount || 0;
        const skippedCount = data.bulkInsertVehicles.skippedCount || 0;
        
        let message = `¡Proceso completado! `;
        if (insertedCount > 0) message += `${insertedCount} vehículos insertados. `;
        if (updatedCount > 0) message += `${updatedCount} vehículos actualizados. `;
        if (skippedCount > 0) message += `${skippedCount} vehículos omitidos (duplicados).`;
        
        toast.success(message);
        
        // Obtener los vehículos para mostrar en el resumen
        const allPlacas = data.map(record => String(record.PLACA || '').toUpperCase().trim());
        
        if (allPlacas.length > 0) {
          // Consultar todos los vehículos (nuevos y existentes) para el resumen
          getVehiclesByPlacas({
            variables: { placas: allPlacas }
          });
        }
        
        if (data.bulkInsertVehicles.errors && data.bulkInsertVehicles.errors.length > 0) {
          // Mostrar solo los primeros 3 errores para no saturar la interfaz
          const errorsToShow = data.bulkInsertVehicles.errors.slice(0, 3);
          errorsToShow.forEach((error: string) => {
            toast.error(error);
          });
          
          if (data.bulkInsertVehicles.errors.length > 3) {
            toast.error(`... y ${data.bulkInsertVehicles.errors.length - 3} errores más`);
          }
        }
      } else {
        toast.error(`Error: ${data.bulkInsertVehicles.message}`);
      }
    },
    onError: (error) => {
      setIsSaving(false);
      toast.error(`Error al guardar: ${error.message}`);
    }
  });

  // Query para obtener vehículos existentes por placas
  const [getVehiclesByPlacas] = useLazyQuery(GET_VEHICLES_BY_PLACAS, {
    onCompleted: (queryData) => {
      // Es para el resumen después del guardado
      setSavedVehicles(queryData.getVehiclesByPlacas);
      setShowSummaryModal(true);
    },
    onError: (error) => {
      toast.error(`Error al obtener datos existentes: ${error.message}`);
    }
  });

  // Función para normalizar los datos del Excel
  const normalizeData = (rawData: any[]) => {
    return rawData.map((row, index) => {
      // Crear un objeto normalizado
      const normalizedRow: any = {};
      
      // Mapear las columnas del Excel a nuestro formato
      Object.keys(row).forEach(key => {
        const lowerKey = key.toLowerCase().trim();
        const value = row[key];
        
        // Mapear las diferentes variaciones de nombres de columna
        if (lowerKey === 'cedula' || lowerKey === 'cédula') {
          normalizedRow.CEDULA = String(value || '').trim(); // Asegurar que sea string
        } else if (lowerKey === 'placa') {
          normalizedRow.PLACA = String(value || '').trim();
        } else if (lowerKey === 'estado') {
          normalizedRow.Estado = String(value || '').trim();
        } else if (lowerKey === 'tipo de vehiculo' || lowerKey === 'tipo de vehículo' || lowerKey === 'tipo') {
          normalizedRow['Tipo de vehículo'] = String(value || '').trim();
        } else if (lowerKey === 'origen') {
          normalizedRow.Origen = String(value || '').trim();
        } else if (lowerKey === 'nombre') {
          normalizedRow.Nombre = String(value || '').trim();
        } else if (lowerKey === 'cargo') {
          normalizedRow.Cargo = String(value || '').trim();
        } else if (lowerKey === 'area' || lowerKey === 'área') {
          normalizedRow.Area = String(value || '').trim();
        }
      });
      
      // Agregar un ID único para evitar problemas con keys duplicadas
      normalizedRow._uniqueId = `${normalizedRow.PLACA || 'unknown'}-${index}`;
      
      return normalizedRow;
    });
  };

  // Función para detectar y reportar duplicados
  const detectDuplicates = (data: VehicleData[]) => {
    const placaCounts: { [key: string]: number } = {};
    const duplicates: string[] = [];
    
    data.forEach(record => {
      const placa = String(record.PLACA || '').toUpperCase().trim();
      if (placa) {
        placaCounts[placa] = (placaCounts[placa] || 0) + 1;
        if (placaCounts[placa] === 2) {
          duplicates.push(placa);
        }
      }
    });
    
    if (duplicates.length > 0) {
      toast.error(`Se detectaron placas duplicadas en el Excel: ${duplicates.join(', ')}`);
      console.warn('Placas duplicadas detectadas:', duplicates);
    }
    
    return duplicates;
  };

  // Función para procesar el archivo Excel
  const processExcelFile = useCallback((file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        
        // Mostrar progreso de procesamiento
        toast.loading(`Procesando ${rawData.length} registros...`);
        
        // Normalizar los datos para que coincidan con nuestra interfaz
        const normalizedData = normalizeData(rawData);
        
        // Detectar duplicados
        detectDuplicates(normalizedData);
        
        // Optimizar datos para mejor rendimiento
        const optimizedData = normalizedData.map((record, index) => ({
          ...record,
          _uniqueId: `${record.PLACA || 'unknown'}-${index}-${Date.now()}`
        }));
        
        setData(optimizedData);
        setFilteredData(optimizedData);
        setCurrentPage(1);
        setIsLoading(false);
        
        toast.dismiss();
        toast.success(`✅ Archivo procesado: ${optimizedData.length} registros cargados`);
        
      } catch (error) {
        console.error('Error al procesar el archivo:', error);
        setIsLoading(false);
        toast.dismiss();
        toast.error('Error al procesar el archivo Excel');
      }
    };
    
    reader.readAsArrayBuffer(file);
  }, []);

  // Configuración de dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processExcelFile(file);
    }
  }, [processExcelFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  // Filtrar datos con debounce para mejor rendimiento
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
    let filtered = data;

      // Filtrar por término de búsqueda (optimizado)
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
          item.CEDULA?.toLowerCase().includes(searchLower) ||
          item.PLACA?.toLowerCase().includes(searchLower) ||
          item.Nombre?.toLowerCase().includes(searchLower) ||
          item.Cargo?.toLowerCase().includes(searchLower) ||
          item.Area?.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por estado
    if (filterStatus !== 'all') {
        const statusLower = filterStatus.toLowerCase();
      filtered = filtered.filter(item => 
          item.Estado?.toLowerCase() === statusLower
      );
    }

    setFilteredData(filtered);
      setCurrentPage(1);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [data, searchTerm, filterStatus]);

  // Cálculos de paginación (memoizados para mejor rendimiento)
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentData = filteredData.slice(startIndex, endIndex);
    
    return { totalPages, startIndex, endIndex, currentData };
  }, [filteredData, currentPage]);

  const { totalPages, startIndex, endIndex, currentData } = paginationData;

  // Función para obtener el color del estado (memoizada)
  const getStatusColor = useCallback((estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactivo':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspendido':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  }, []);

  const getStatusIcon = useCallback((estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactivo':
        return <XCircle className="w-4 h-4" />;
      case 'suspendido':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  }, []);

  // Función para exportar datos
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, `vehiculos_exportados_${new Date().toISOString().split('T')[0]}.xlsx`);
  };



  // Función para guardar datos directamente (sin comparación previa)
  const saveToDatabase = async () => {
    if (data.length === 0) {
      toast.error('No hay datos para guardar');
      return;
    }

    setIsSaving(true);
    setShowProgress(true);
    setProgress({ current: 0, total: data.length, message: 'Iniciando guardado...' });
    
    // Mostrar progreso inicial
    const loadingToast = toast.loading(`Procesando ${data.length} vehículos...`);
    
    try {
      // Optimizar el formato de datos antes del envío
      const vehiclesFormatted = data.map(record => ({
        placa: String(record.PLACA || '').trim().toUpperCase(),
        cedula: String(record.CEDULA || '').trim(),
        estado: String(record.Estado || 'ACTIVO').trim().toUpperCase(),
        tipoVehiculo: String(getTipoVehiculo(record) || 'AUTOMOVIL').trim().toUpperCase(),
        origen: String(record.Origen || 'EXCEL').trim().toUpperCase(),
        nombre: String(record.Nombre || '').trim(),
        cargo: String(record.Cargo || '').trim(),
        area: String(record.Area || '').trim()
      }));

      // Dividir en lotes optimizados según el tamaño
      const BATCH_SIZE = Math.min(100, Math.max(50, Math.floor(vehiclesFormatted.length / 10)));
      const batches = [];
      
      for (let i = 0; i < vehiclesFormatted.length; i += BATCH_SIZE) {
        batches.push(vehiclesFormatted.slice(i, i + BATCH_SIZE));
      }

      let totalInserted = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;
      let totalErrors = 0;

      // Procesar lotes con mejor gestión de memoria
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        
        // Actualizar progreso
        const currentProgress = Math.min((i * BATCH_SIZE) + batch.length, data.length);
        setProgress({ 
          current: currentProgress, 
          total: data.length, 
          message: `Procesando lote ${i + 1} de ${batches.length}...` 
        });
        
        if (batches.length > 1) {
          toast.loading(`Procesando lote ${i + 1} de ${batches.length} (${batch.length} vehículos)...`, {
            id: loadingToast
          });
        }

        try {
          const result = await bulkInsertVehicles({
            variables: { vehicles: batch }
          });

          const resultData = result.data?.bulkInsertVehicles;
          if (resultData) {
            totalInserted += resultData.insertedCount || 0;
            totalUpdated += resultData.updatedCount || 0;
            totalSkipped += resultData.skippedCount || 0;
            if (resultData.errors) totalErrors += resultData.errors.length;
          }

        } catch (batchError) {
          console.error(`Error en lote ${i + 1}:`, batchError);
          totalErrors++;
        }
        
        // Pequeña pausa para permitir que la UI se actualice
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      // Mostrar resumen final
      toast.dismiss(loadingToast);
      setShowProgress(false);
      setIsSaving(false);
      
      let summaryMessage = `✅ Proceso completado: `;
      if (totalInserted > 0) summaryMessage += `${totalInserted} insertados, `;
      if (totalUpdated > 0) summaryMessage += `${totalUpdated} actualizados, `;
      if (totalSkipped > 0) summaryMessage += `${totalSkipped} omitidos, `;
      if (totalErrors > 0) summaryMessage += `${totalErrors} errores`;
      
      toast.success(summaryMessage);
      
      // Obtener vehículos para el resumen final
      const allPlacas = data.map(record => String(record.PLACA || '').toUpperCase().trim());
      if (allPlacas.length > 0) {
        getVehiclesByPlacas({
          variables: { placas: allPlacas }
        });
      }
      
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.dismiss(loadingToast);
      setShowProgress(false);
      setIsSaving(false);
      toast.error('Error inesperado al guardar los datos');
    }
  };






  // Función para editar registro (optimizada)
  const startEdit = useCallback((index: number, record: VehicleData) => {
    setEditingRow(index);
    setEditData({ ...record });
  }, []);

  const saveEdit = useCallback(() => {
    if (editingRow !== null && editData) {
      setData(prevData => {
        const newData = [...prevData];
        const originalIndex = newData.findIndex(item => 
          item._uniqueId === currentData[editingRow]._uniqueId
      );
      if (originalIndex !== -1) {
        newData[originalIndex] = editData;
      }
        return newData;
      });
      setEditingRow(null);
      setEditData(null);
    }
  }, [editingRow, editData, currentData]);

  const cancelEdit = useCallback(() => {
    setEditingRow(null);
    setEditData(null);
  }, []);

  // Función para eliminar registros (optimizada)
  const deleteSelected = useCallback(() => {
    if (selectedRows.size === 0) return;
    
    const selectedUniqueIds = new Set(
      Array.from(selectedRows).map(index => currentData[index]?._uniqueId).filter(Boolean)
    );
    
    setData(prevData => prevData.filter(item => !selectedUniqueIds.has(item._uniqueId)));
    setSelectedRows(new Set());
  }, [selectedRows, currentData]);

  // Función para agregar nuevo registro (optimizada)
  const addNewRecord = useCallback(() => {
    if (!newRecord.CEDULA || !newRecord.PLACA || !newRecord.Nombre) {
      toast.error('Por favor complete los campos obligatorios: Cédula, Placa y Nombre');
      return;
    }
    
    const newRecordWithId = {
      ...newRecord,
      PLACA: newRecord.PLACA.toUpperCase(),
      _uniqueId: `${newRecord.PLACA.toUpperCase()}-${Date.now()}-${Math.random()}`
    };
    
    setData(prevData => [...prevData, newRecordWithId]);
    setNewRecord({
      CEDULA: '',
      PLACA: '',
      Estado: 'Activo',
      'Tipo de vehículo': '',
      Origen: '',
      Nombre: '',
      Cargo: '',
      Area: ''
    });
    setShowAddForm(false);
  }, [newRecord]);



  // Componente de paginación (optimizado)
  const PaginationControls = useCallback(() => (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-green-200">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} registros
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="p-2 text-gray-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 text-gray-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

  return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 text-sm rounded-md ${
                  currentPage === pageNum
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-green-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  ), [currentPage, totalPages, startIndex, endIndex, filteredData.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Gestión de Datos de Vehículos
          </h1>
          <p className="text-gray-600">
            Carga, visualiza y gestiona la información de vehículos desde archivos Excel
          </p>
            </div>
          </div>
        </div>

        {/* Zona de carga de archivos */}
        {data.length === 0 && (
          <div className="mb-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer ${
                isDragActive
                  ? 'border-green-500 bg-green-50 scale-105'
                  : 'border-green-300 hover:border-green-400 hover:bg-green-50/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  {isLoading ? (
                    <RefreshCw className="w-10 h-10 text-white animate-spin" />
                  ) : (
                    <Upload className="w-10 h-10 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {isDragActive ? '¡Suelta el archivo aquí!' : 'Arrastra tu archivo Excel aquí'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    o haz clic para seleccionar un archivo
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Formatos soportados: .xlsx, .xls, .csv</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Panel de control y datos */}
        {data.length > 0 && (
          <>
            {/* Barra de progreso */}
            {showProgress && (
              <div className="mb-6 bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-800">
                    <RefreshCw className="w-5 h-5 inline mr-2 animate-spin" />
                    Procesando Datos
                  </h3>
                  <span className="text-sm text-gray-600">
                    {progress.current} / {progress.total}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.min((progress.current / progress.total) * 100, 100)}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-600">{progress.message}</p>
              </div>
            )}

            {/* Barra de herramientas */}
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Búsqueda y filtros */}
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por cualquier campo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-10 pr-8 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white min-w-[150px]"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="suspendido">Suspendido</option>
                    </select>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <label className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Cargar Nuevo</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processExcelFile(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                  
                  {selectedRows.size > 0 && (
                    <button
                      onClick={deleteSelected}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar ({selectedRows.size})</span>
                    </button>
                  )}
                  
                  <button
                    onClick={exportToExcel}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                  
                  {data.length > 0 && (
                    <>
                                              <button
                          onClick={saveToDatabase}
                          disabled={isSaving}
                          className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Guardando...</span>
                            </>
                          ) : (
                            <>
                              <Database className="w-4 h-4" />
                              <span>Guardar en BD</span>
                            </>
                          )}
                        </button>
                      

                    </>
                  )}
                </div>
              </div>

              {/* Estadísticas */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Total</p>
                      <p className="text-2xl font-bold text-green-800">{data.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Activos</p>
                      <p className="text-2xl font-bold text-green-800">
                        {data.filter(item => item.Estado?.toLowerCase() === 'activo').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Inactivos</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {data.filter(item => item.Estado?.toLowerCase() === 'inactivo').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-red-600 font-medium">Suspendidos</p>
                      <p className="text-2xl font-bold text-red-800">
                        {data.filter(item => item.Estado?.toLowerCase() === 'suspendido').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Rendimiento</p>
                      <p className="text-lg font-bold text-blue-800">
                        {data.length > 1000 ? 'Lote' : 'Directo'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de datos */}
              <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                    <colgroup>
                      <col className="w-12" /> {/* Checkbox */}
                      <col className="w-32" /> {/* Cédula */}
                      <col className="w-24" /> {/* Placa */}
                      <col className="w-20" /> {/* Estado */}
                      <col className="w-24" /> {/* Tipo */}
                      <col className="w-48" /> {/* Nombre */}
                      <col className="w-32" /> {/* Cargo */}
                      <col className="w-32" /> {/* Área */}
                      <col className="w-24" /> {/* Origen */}
                      <col className="w-16" /> {/* Acciones */}
                    </colgroup>
                  <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                    <tr>
                      <th className="px-4 py-4 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows(new Set(Array.from({ length: currentData.length }, (_, i) => i)));
                            } else {
                              setSelectedRows(new Set());
                            }
                          }}
                          className="rounded border-green-300 text-green-600 focus:ring-green-500"
                        />
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-green-700">Cédula</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-green-700">Placa</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-green-700">Estado</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-green-700">Tipo</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-green-700">Nombre</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-green-700">Cargo</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-green-700">Área</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-green-700">Origen</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-green-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentData.map((record, index) => (
                      <tr key={record._uniqueId || `${record.PLACA}-${startIndex + index}`} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(index)}
                            onChange={handleCheckboxChange(index)}
                            className="rounded border-green-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          {editingRow === index ? (
                            <input
                              type="text"
                              value={editData?.CEDULA || ''}
                              onChange={(e) => setEditData(prev => prev ? { ...prev, CEDULA: e.target.value } : null)}
                              className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-green-400" />
                              <span className="text-sm font-medium text-gray-900">{record.CEDULA}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {editingRow === index ? (
                            <input
                              type="text"
                              value={editData?.PLACA || ''}
                              onChange={(e) => setEditData(prev => prev ? { ...prev, PLACA: e.target.value.toUpperCase() } : null)}
                              className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Tag className="w-4 h-4 text-green-400" />
                              <span className="text-sm font-mono font-bold text-gray-900 bg-green-100 px-2 py-1 rounded">
                                {record.PLACA}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {editingRow === index ? (
                            <select
                              value={editData?.Estado || ''}
                              onChange={(e) => setEditData(prev => prev ? { ...prev, Estado: e.target.value } : null)}
                              className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                            >
                              <option value="Activo">Activo</option>
                              <option value="Inactivo">Inactivo</option>
                              <option value="Suspendido">Suspendido</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.Estado)}`}>
                              {getStatusIcon(record.Estado)}
                              <span>{record.Estado}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {editingRow === index ? (
                            <input
                              type="text"
                              value={editData?.['Tipo de vehículo'] || ''}
                              onChange={(e) => setEditData(prev => prev ? { ...prev, 'Tipo de vehículo': e.target.value } : null)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Car className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{getTipoVehiculo(record)}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {editingRow === index ? (
                            <input
                              type="text"
                              value={editData?.Nombre || ''}
                              onChange={(e) => setEditData(prev => prev ? { ...prev, Nombre: e.target.value } : null)}
                              className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{record.Nombre}</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {editingRow === index ? (
                            <input
                              type="text"
                              value={editData?.Cargo || ''}
                              onChange={(e) => setEditData(prev => prev ? { ...prev, Cargo: e.target.value } : null)}
                              className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-gray-900">{record.Cargo}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {editingRow === index ? (
                            <input
                              type="text"
                              value={editData?.Area || ''}
                              onChange={(e) => setEditData(prev => prev ? { ...prev, Area: e.target.value } : null)}
                              className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-gray-900">{record.Area}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {editingRow === index ? (
                            <input
                              type="text"
                              value={editData?.Origen || ''}
                              onChange={(e) => setEditData(prev => prev ? { ...prev, Origen: e.target.value } : null)}
                              className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                            />
                          ) : (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-gray-900">{record.Origen}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            {editingRow === index ? (
                              <>
                                <button
                                  onClick={saveEdit}
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-150"
                                  title="Guardar"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                                  title="Cancelar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEdit(index, record)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-150"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && <PaginationControls />}

              {filteredData.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <FileX className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                </div>
              )}
            </div>

            {/* Formulario para agregar nuevo registro */}
            {showAddForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-green-200 bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-green-800">Agregar Nuevo Registro</h3>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="p-2 text-green-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-150"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cédula <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newRecord.CEDULA}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, CEDULA: e.target.value }))}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Ingrese la cédula"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Placa <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newRecord.PLACA}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, PLACA: e.target.value.toUpperCase() }))}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="ABC123"
                          maxLength={6}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                        <select
                          value={newRecord.Estado}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, Estado: e.target.value }))}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                          <option value="Suspendido">Suspendido</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Vehículo</label>
                        <input
                          type="text"
                          value={newRecord['Tipo de vehículo']}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, 'Tipo de vehículo': e.target.value }))}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Ej: Motocicleta, Automóvil"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newRecord.Nombre}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, Nombre: e.target.value }))}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Nombre completo"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                        <input
                          type="text"
                          value={newRecord.Cargo}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, Cargo: e.target.value }))}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Cargo o posición"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Área</label>
                        <input
                          type="text"
                          value={newRecord.Area}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, Area: e.target.value }))}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Área de trabajo"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Origen</label>
                        <input
                          type="text"
                          value={newRecord.Origen}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, Origen: e.target.value }))}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Origen o procedencia"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-150"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={addNewRecord}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-150"
                      >
                        Agregar Registro
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {/* Modal de resumen */}
            {showSummaryModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-green-200 bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-green-800">
                        <ClipboardList className="w-5 h-5 inline mr-2" />
                        {hasNewInserts ? 'Resumen de Vehículos Guardados' : 'Resumen de Vehículos Existentes'}
                      </h3>
                      <button
                        onClick={() => setShowSummaryModal(false)}
                        className="p-2 text-green-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-150"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 overflow-y-auto max-h-[70vh]">
                    <h4 className="text-lg font-medium text-green-700 mb-4">
                      <Info className="w-5 h-5 inline mr-2" />
                      {hasNewInserts ? 'Vehículos Guardados' : 'Vehículos en Base de Datos'}
                    </h4>
                    
                    {!hasNewInserts && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center">
                          <Info className="w-5 h-5 text-blue-600 mr-2" />
                          <p className="text-blue-800 text-sm">
                            <strong>Información:</strong> Todos los vehículos del Excel ya existen en la base de datos. 
                            No se realizaron inserciones para evitar duplicados. Puedes revisar y editar las cédulas si es necesario.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border border-green-100">
                        <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-green-700">Placa</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-green-700">Cédula</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-green-700">Estado</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-green-700">Tipo</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-green-700">Nombre</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-green-700">Cargo</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-green-700">Área</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-green-700">Origen</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-green-700">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-100">
                          {savedVehicles.map((vehicle, index) => (
                            <tr key={`saved-${vehicle.id}-${index}`} className="hover:bg-green-50 transition-colors duration-150">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{vehicle.placa}</td>
                              <td className="px-4 py-3 text-sm">
                                {editingCedula === vehicle.placa ? (
                                  <input
                                    type="text"
                                    value={tempCedula}
                                    onChange={(e) => setTempCedula(e.target.value)}
                                    className="w-full px-2 py-1 border border-green-300 rounded text-sm focus:ring-1 focus:ring-green-500"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-900">{vehicle.cedula}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vehicle.estado)}`}>
                                  {getStatusIcon(vehicle.estado)}
                                  <span>{vehicle.estado}</span>
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{vehicle.tipoVehiculo}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{vehicle.nombre || vehicle.conductor?.name || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{vehicle.cargo}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{vehicle.area}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{vehicle.origen}</td>
                              <td className="px-4 py-3 text-sm">
                                {editingCedula === vehicle.placa ? (
                                  <button
                                    onClick={() => updateVehicleCedula({
                                      variables: { placa: vehicle.placa, cedula: tempCedula }
                                    })}
                                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-150"
                                    title="Guardar Cédula"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setEditingCedula(vehicle.placa)}
                                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-150"
                                    title="Editar Cédula"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-green-200 bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowSummaryModal(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-150"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExcelDataLoader;