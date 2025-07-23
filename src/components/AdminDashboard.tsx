"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { DashboardStyles } from "@/styles/dashboard-styles"
import { DashboardHeader } from "./dashboard-admin/dashboard-header"
import { DashboardTabs } from "./dashboard-admin/dashboard-tabs"
import { DashboardContent } from "./dashboard-admin/dashboard-content"
import { UserManagementSimple } from "./dashboard-admin/user-management-simple"
import { SettingsContent } from "./dashboard-admin/settings-content"
import type { AdminDashboardProps, SearchRecord } from "@/types/dashboard-types"
import { useQuery } from "@apollo/client"
import { GET_VEHICLE_VERIFICATION_LOGS } from "@/graphql/search-records"

const AdminDashboard = ({ userData, onLogout }: AdminDashboardProps) => {
  const [searchRecords, setSearchRecords] = useState<SearchRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")

  const { toast } = useToast()

  // Verificar si hay un token de autenticación
  const authToken = localStorage.getItem('authToken');
  console.log("Token de autenticación disponible:", !!authToken);

  // Cargar datos reales de verificaciones de vehículos mediante GraphQL
  const { loading, error, data, refetch } = useQuery(GET_VEHICLE_VERIFICATION_LOGS, {
    variables: { skip: 0, take: 1000 }, // Aumentar el límite para asegurar que obtenemos todos los datos disponibles
    fetchPolicy: "network-only", // No usar caché, siempre obtener datos frescos
    notifyOnNetworkStatusChange: true, // Notificar cambios en el estado de la red
    onError: (error) => {
      console.error("Error en la consulta GraphQL:", error);
      console.error("Mensaje de error:", error.message);
      if (error.graphQLErrors) {
        console.error("Errores GraphQL:", error.graphQLErrors);
      }
      if (error.networkError) {
        console.error("Error de red:", error.networkError);
        // Intentar obtener más detalles sobre el error de red
        if (error.networkError.statusCode) {
          console.error("Código de estado HTTP:", error.networkError.statusCode);
        }
        if (error.networkError.bodyText) {
          console.error("Respuesta del servidor:", error.networkError.bodyText);
        }
      }
    }
  })

  useEffect(() => {
    console.log("Estado de carga:", { loading, error, data });
    
    if (loading) {
      setIsLoading(true)
      return
    }

    if (error) {
      console.error("Error detallado:", error);
      toast({
        title: "Error",
        description: `No se pudieron cargar los datos: ${error.message}`,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }
    
    // Verificar la estructura completa de la respuesta
    console.log("Estructura completa de la respuesta:", JSON.stringify(data, null, 2));

    if (data && data.getVehicleVerificationLogs) {
      console.log("Datos de getVehicleVerificationLogs:", data.getVehicleVerificationLogs);
      
      // Verificar si hay logs disponibles
      const logs = data.getVehicleVerificationLogs.logs || [];
      console.log("Logs encontrados:", logs.length);
      
      // Imprimir el primer log para depuración si existe
      if (logs.length > 0) {
        console.log("Ejemplo del primer log:", logs[0]);
      }
      
      // Transformar los datos del backend al formato SearchRecord
      const formattedRecords: SearchRecord[] = logs.map((log: any) => {
        try {
          // Calcular la duración de la sesión en minutos con manejo de errores
          let startTime, endTime, sessionDuration = 0;
          
          try {
            startTime = log.startTime ? new Date(log.startTime) : new Date();
            endTime = log.endTime ? new Date(log.endTime) : new Date();
            sessionDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
            if (isNaN(sessionDuration) || sessionDuration < 0) sessionDuration = 0;
          } catch (e) {
            console.error("Error al calcular la duración de la sesión:", e);
            sessionDuration = 0;
          }
          
          // Crear el objeto SearchRecord con manejo seguro de propiedades
          return {
            id: log.id || 'sin-id',
            userId: log.userId || 'desconocido',
            userName: (log.user && log.user.name) ? log.user.name : 'Usuario ' + (log.userId || 'desconocido'),
            plateNumber: log.placa || 'Sin placa',
            searchTime: log.startTime || new Date().toISOString(),
            exitTime: log.endTime,
            sessionDuration: sessionDuration,
            vehicleInfo: {
              owner: 'No disponible', // Estos datos no están disponibles en el log
              brand: 'No disponible',
              model: 'No disponible',
              year: 'No disponible',
              status: log.encontrado ? 'Activo' : 'No encontrado',
            },
          };
        } catch (error) {
          console.error("Error al procesar un log:", error, log);
          // Devolver un registro con valores predeterminados en caso de error
          return {
            id: 'error',
            userId: 'error',
            userName: 'Error al procesar',
            plateNumber: 'Error',
            searchTime: new Date().toISOString(),
            exitTime: null,
            sessionDuration: 0,
            vehicleInfo: {
              owner: 'Error',
              brand: 'Error',
              model: 'Error',
              year: 'Error',
              status: 'Error',
            },
          };
        }
      });
      
      console.log("Registros formateados:", formattedRecords.length);
      setSearchRecords(formattedRecords);
      setIsLoading(false);
    } else {
      console.log("No se encontraron datos en la respuesta GraphQL");
      setSearchRecords([]);
      toast({
        title: "Sin datos",
        description: "No se encontraron registros de verificaciones de vehículos.",
      });
      setIsLoading(false);
    }
  }, [data, loading, error, toast])

  // Estadísticas
  const totalSearches = searchRecords.length
  const uniqueUsers = new Set(searchRecords.map((r) => r.userId)).size
  const activeSessions = searchRecords.filter((r) => r.exitTime === null).length
  const averageSessionTime =
    searchRecords.filter((r) => r.exitTime !== null).reduce((acc, r) => acc + r.sessionDuration, 0) /
      searchRecords.filter((r) => r.exitTime !== null).length || 0

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await refetch()
      toast({
        title: "Datos actualizados",
        description: "La información ha sido actualizada exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportToExcel = () => {
    toast({
      title: "Exportación exitosa",
      description: "Archivo descargado correctamente",
    })
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-emerald-50 via-green-50 to-white animate-gradient-shift">
      <DashboardStyles />

      <DashboardHeader
        userData={userData}
        onLogout={onLogout}
        onRefresh={handleRefresh}
        onExport={handleExportToExcel}
        isLoading={isLoading}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "dashboard" && (
          <TabsContent value="dashboard" className="mt-6 space-y-6">
            <DashboardContent
              totalSearches={totalSearches}
              uniqueUsers={uniqueUsers}
              activeSessions={activeSessions}
              averageSessionTime={averageSessionTime}
              searchRecords={searchRecords}
            />
          </TabsContent>
        )}

        {activeTab === "users" && (
          <TabsContent value="users" className="mt-6">
            <UserManagementSimple />
          </TabsContent>
        )}

        {activeTab === "settings" && (
          <TabsContent value="settings" className="mt-6">
            <SettingsContent />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default AdminDashboard
