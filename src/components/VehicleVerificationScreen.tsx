"use client"

import { useState, useEffect, useCallback } from "react"
import { gql, useLazyQuery, useMutation } from "@apollo/client"
import toast from "react-hot-toast"
import {
  Car,
  Search,
  CheckCircle,
  XCircle,
  LogOut,
  Plus,
  Info,
  User,
  Briefcase,
  Building,
  Shield,
  FileText,
  Tag,
  Calendar,
  MapPin,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import VehicleRegistrationScreen from "./VehicleRegistrationScreen"

// Definición de la consulta GraphQL
const GET_VEHICLE_BY_PLACA = gql`
  query GetVehicleByPlaca($placa: String!) {
    getVehicleByPlaca(placa: $placa) {
      id
      placa
      estado
      tipoVehiculo
      origen
      cargo
      area
      createdAt
      conductor {
        id
        name
      }
    }
  }
`

// Mutación para registrar la verificación de vehículo
const LOG_VEHICLE_VERIFICATION = gql`
  mutation LogVehicleVerification($input: VehicleVerificationInput!) {
    logVehicleVerification(input: $input) {
      id
      placa
      encontrado
      startTime
      endTime
    }
  }
`

interface VehicleVerificationScreenProps {
  userData: { cedula: string; name: string } | null
  onLogout: () => void
}

interface Vehicle {
  id: string
  placa: string
  estado: string
  tipoVehiculo: string
  origen: string
  cargo: string
  area: string
  createdAt: string
  conductor?: {
    id: string
    name: string
  }
  // Campos adicionales para compatibilidad con la interfaz existente
  marca?: string
  modelo?: string
  propietario?: string
  cedula?: string
  año?: number
  color?: string
}

const VehicleVerificationScreen = ({ userData, onLogout }: VehicleVerificationScreenProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null)
  const [placaSuggestions, setPlacaSuggestions] = useState(["ABC123", "XYZ789", "DEF456"])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("info")
  const [hasSearched, setHasSearched] = useState(false)
  const [searchStartTime, setSearchStartTime] = useState<Date | null>(null)

  const [suggestedVehicles, setSuggestedVehicles] = useState<any[]>([])
  const [showRegistration, setShowRegistration] = useState(false)
  const [examplePlates] = useState<string[]>(["ABC123", "XYZ789", "DEF456", "GHI789", "JKL012", "MNO345"])
  const { toast: uiToast } = useToast()
  
  // Mutación para registrar la verificación de vehículo
  const [logVehicleVerification] = useMutation(LOG_VEHICLE_VERIFICATION, {
    onCompleted: (data) => {
      console.log("Verificación registrada:", data)
    },
    onError: (error) => {
      console.error("Error al registrar verificación:", error)
    }
  })

  const [getVehicleByPlaca, { loading: queryLoading, error: queryError, data: vehicleData }] = useLazyQuery(
    GET_VEHICLE_BY_PLACA,
    {
      fetchPolicy: "network-only",
      onCompleted: (data) => {
        setIsLoading(false)
        const endTime = new Date()
        const encontrado = !!data?.getVehicleByPlaca
        
        // Registrar la verificación
        logVehicleVerification({
          variables: {
            input: {
              placa: searchTerm.trim(),
              encontrado,
              userId: userData?.cedula || null,
              startTime: searchStartTime?.toISOString(),
              endTime: endTime.toISOString()
            }
          }
        })
        
        if (encontrado) {
          setCurrentVehicle(data.getVehicleByPlaca)
          setIsModalOpen(true)
          toast.success(`Vehículo encontrado: ${data.getVehicleByPlaca.placa}`)
        } else {
          setCurrentVehicle(null)
          toast.error("Vehículo no encontrado")
          // No limpiar searchTerm aquí para que se muestre en el mensaje de error
        }
      },
      onError: (error) => {
        console.error("Error al buscar vehículo:", error)
        toast.error("Error al buscar vehículo")
        setIsLoading(false)
        setCurrentVehicle(null)
        
        // Registrar la verificación fallida
        const endTime = new Date()
        logVehicleVerification({
          variables: {
            input: {
              placa: searchTerm.trim(),
              encontrado: false,
              userId: userData?.cedula || null,
              startTime: searchStartTime?.toISOString(),
              endTime: endTime.toISOString()
            }
          }
        })
        
        // No limpiar searchTerm aquí tampoco
      },
    },
  )

  // Buscar sugerencias de placas mientras el usuario escribe
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const suggestions = placaSuggestions
        .filter((placa) => placa.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((placa) => ({ placa, marca: "Ejemplo", modelo: "Modelo" }))
      setSuggestedVehicles(suggestions)
    } else {
      setSuggestedVehicles([])
    }
  }, [searchTerm, placaSuggestions])

  useEffect(() => {
    return () => {
      setIsLoading(false)
      setSearchTerm("")
      setCurrentVehicle(null)
    }
  }, [])

  // Ocultar mensaje de error cuando el usuario sigue escribiendo después de una búsqueda fallida
  useEffect(() => {
    if (hasSearched && !currentVehicle && !isLoading) {
      // Si el usuario está escribiendo después de una búsqueda fallida, ocultar el mensaje
      setHasSearched(false)
    }
  }, [searchTerm])

  // Función para buscar vehículo
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      toast.error("Por favor ingrese una placa para buscar")
      return
    }

    if (isLoading) return

    setIsLoading(true)
    setHasSearched(true)
    setSearchStartTime(new Date())

    try {
      getVehicleByPlaca({ variables: { placa: searchTerm.trim() } })
    } catch (error) {
      console.error("Error al buscar vehículo:", error)
      toast.error("Error al buscar vehículo")
      setIsLoading(false)
    }
  }, [searchTerm, getVehicleByPlaca, isLoading])

  const handleNewSearch = () => {
    setSearchTerm("")
    setCurrentVehicle(null)
    setIsModalOpen(false)
    setIsLoading(false)
    setSuggestedVehicles([])
    setActiveTab("info")
    setHasSearched(false)
  }

  const handleExamplePlateClick = (plate: string) => {
    setSearchTerm(plate)
  }

  const handleRegisterVehicle = () => {
    setShowRegistration(true)
  }

  const handleBackFromRegistration = () => {
    setShowRegistration(false)
  }

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "activo":
        return "bg-green-500 text-white shadow-sm"
      case "inactivo":
        return "bg-gray-400 text-white shadow-sm"
      case "suspendido":
        return "bg-red-500 text-white shadow-sm"
      default:
        return "bg-blue-500 text-white shadow-sm"
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "activo":
        return <CheckCircle className="w-4 h-4" />
      case "inactivo":
        return <XCircle className="w-4 h-4" />
      case "suspendido":
        return <Shield className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  // Si estamos en la pantalla de registro, mostrarla
  if (showRegistration) {
    return <VehicleRegistrationScreen userData={userData} onBack={handleBackFromRegistration} />
  }

  return (
    <>
      {/* Estilos CSS mejorados */}
      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        .animate-slide-up {
          animation: slideInUp 0.5s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-pulse-gentle {
          animation: pulse 2s infinite;
        }
        
        /* Mejoras para scroll suave */
        .smooth-scroll {
          scroll-behavior: smooth;
        }
        
        /* Prevenir overflow horizontal */
        .prevent-overflow {
          overflow-x: hidden;
        }
        
        /* Asegurar que los elementos no se salgan en móviles */
        .safe-area {
          padding-left: max(1rem, env(safe-area-inset-left));
          padding-right: max(1rem, env(safe-area-inset-right));
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 prevent-overflow flex flex-col">
        <div className="safe-area py-4 md:py-6">
          {/* Header con saludo y logout - Mejorado para móviles */}
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6 animate-fade-in">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100/50 px-4 sm:px-5 py-3 sm:py-4 w-full sm:w-auto transform hover:scale-[1.01] transition-all duration-300">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1">
                  ¡Hola, {userData?.name}! 👋
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">Verifica tu vehículo de forma rápida</p>
              </div>

              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="rounded-xl border border-green-200 bg-white/90 backdrop-blur-sm shadow-md hover:bg-green-50 hover:border-green-300 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-sm">Salir</span>
              </Button>
            </div>

            {/* Tarjeta principal de verificación - Optimizada para todos los tamaños */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-green-100/50 p-4 sm:p-6 md:p-8 animate-slide-up max-w-3xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-16 sm:w-18 md:w-20 h-16 sm:h-18 md:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-3 sm:mb-4 shadow-lg animate-pulse-gentle">
                  <Car className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Verificación de Vehículo
                </h2>
                <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed px-2">
                  Ingresa la placa de tu vehículo para verificar su registro en nuestro sistema
                </p>
              </div>

              {/* Campo de búsqueda - Completamente responsive */}
              <div className="max-w-md mx-auto mb-6 sm:mb-8">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                    <Car className="w-5 h-5 text-green-500 group-focus-within:text-green-600 transition-colors duration-300" />
                  </div>
                  <Input
                    type="text"
                    placeholder="ABC123"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    className="pl-11 sm:pl-12 h-14 sm:h-16 rounded-2xl border-2 border-green-200 bg-white shadow-lg focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all duration-300 text-gray-800 placeholder:text-gray-400 text-center text-lg sm:text-xl font-semibold tracking-wider hover:shadow-xl w-full"
                    disabled={isLoading}
                    maxLength={6}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/10 to-green-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full mt-6 h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed max-w-md mx-auto flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verificando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <Search className="w-5 h-5" />
                      <span>Verificar Vehículo</span>
                    </div>
                  )}
                </Button>
              </div>

              {/* Resultado de vehículo no encontrado - Responsive */}
              {hasSearched && !currentVehicle && !isLoading && (
                <div className="max-w-md mx-auto animate-scale-in">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 sm:p-6 border-2 border-red-200 shadow-lg">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-red-500 rounded-full mb-3 sm:mb-4 shadow-lg animate-pulse-gentle">
                        <XCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Vehículo No Encontrado</h3>
                      <p className="text-gray-700 text-sm mb-4 sm:mb-5 leading-relaxed px-2">
                        No encontramos la placa{" "}
                        <span className="font-bold text-red-600 bg-red-100 px-2 py-1 rounded">{searchTerm}</span> en
                        nuestros registros.
                      </p>
                      <div className="space-y-3 max-w-xs mx-auto">
                        <Button
                          onClick={handleRegisterVehicle}
                          className="w-full rounded-xl bg-red-500 hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Registrar Vehículo
                        </Button>
                        <Button
                          onClick={handleNewSearch}
                          variant="outline"
                          className="w-full rounded-xl border-red-300 text-red-600 hover:bg-red-50 transition-all duration-300"
                        >
                          Buscar Otra Placa
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal completamente optimizado para móviles */}
            <Dialog
              open={isModalOpen}
              onOpenChange={(open) => {
                setIsModalOpen(open)
                if (!open) {
                  setSearchTerm("")
                  setCurrentVehicle(null)
                  setIsLoading(false)
                  setSuggestedVehicles([])
                  setActiveTab("info")
                }
              }}
            >
              <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-0 p-0 m-2 sm:m-4 mx-auto">
                {currentVehicle && (
                  <div className="flex flex-col h-full animate-scale-in">
                    {/* Header optimizado para móviles */}
                    <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white p-4 sm:p-6 overflow-hidden">
                      {/* Elementos decorativos responsivos */}
                      <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-2xl transform translate-x-6 sm:translate-x-8 -translate-y-6 sm:-translate-y-8"></div>
                      <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-white/5 rounded-full blur-xl transform -translate-x-3 sm:-translate-x-4 translate-y-3 sm:translate-y-4"></div>

                      {/* Botón de cerrar responsive */}
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-3 sm:top-4 right-3 sm:right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="relative z-10">
                        <div className="flex items-center justify-center mb-3 sm:mb-4">
                          <div className="relative">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                              <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                            </div>
                          </div>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">¡Verificación Exitosa!</h2>
                        <p className="text-white/90 text-center text-sm mb-3 sm:mb-4 px-2">
                          {currentVehicle.marca || "Vehículo"} {currentVehicle.modelo || ""}
                          {currentVehicle.año && ` • ${currentVehicle.año}`}
                        </p>

                        {/* Placa destacada responsive */}
                        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/20 text-center mb-3 sm:mb-4">
                          <p className="text-white/80 text-xs font-medium mb-1">PLACA</p>
                          <p className="text-2xl sm:text-3xl font-black tracking-wider">{currentVehicle.placa}</p>
                        </div>

                        {/* Estado responsive */}
                        <div className="flex justify-center">
                          <Badge
                            className={`${getStatusColor(currentVehicle.estado)} px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-semibold shadow-lg`}
                          >
                            <div className="flex items-center">
                              {getStatusIcon(currentVehicle.estado)}
                              <span className="ml-2">{currentVehicle.estado.toUpperCase()}</span>
                            </div>
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Navegación de pestañas optimizada */}
                    <div className="flex bg-gray-50 border-b border-gray-200">
                      {[
                        { id: "info", label: "Info", icon: Info },
                        { id: "conductor", label: "Conductor", icon: User },
                        { id: "detalles", label: "Detalles", icon: FileText },
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          className={`flex-1 py-3 px-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                            activeTab === id
                              ? "text-green-600 border-b-2 border-green-500 bg-white"
                              : "text-gray-500 hover:text-green-600 hover:bg-white/50"
                          }`}
                          onClick={() => setActiveTab(id)}
                        >
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            <Icon className="w-4 h-4" />
                            <span className="hidden xs:inline sm:inline">{label}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Contenido del tab con scroll optimizado */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gray-50 smooth-scroll">
                      {/* Tab de Información */}
                      {activeTab === "info" && (
                        <div className="space-y-3 sm:space-y-4 animate-fade-in">
                          {/* Información principal */}
                          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                                <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                              </div>
                              Datos del Vehículo
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                              {[
                                { label: "Placa", value: currentVehicle.placa, icon: Tag },
                                { label: "Tipo", value: currentVehicle.tipoVehiculo, icon: Car },
                                { label: "Estado", value: currentVehicle.estado, icon: Shield, isStatus: true },
                                {
                                  label: "Registro",
                                  value: new Date(currentVehicle.createdAt).toLocaleDateString("es-CO"),
                                  icon: Calendar,
                                },
                              ].map(({ label, value, icon: Icon, isStatus }) => (
                                <div
                                  key={label}
                                  className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                                >
                                  <div className="flex items-center min-w-0">
                                    <Icon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                                    <span className="text-gray-600 text-sm">{label}:</span>
                                  </div>
                                  <div className="ml-2 flex-shrink-0">
                                    {isStatus ? (
                                      <Badge className={`${getStatusColor(value)} text-xs`}>{value}</Badge>
                                    ) : (
                                      <span className="font-semibold text-gray-800 text-sm">{value}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Información laboral */}
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 sm:p-5 border border-green-200">
                            <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-3 sm:mb-4 flex items-center">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-200 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-700" />
                              </div>
                              Información Laboral
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                              {[
                                { label: "Origen", value: currentVehicle.origen, icon: MapPin },
                                { label: "Cargo", value: currentVehicle.cargo, icon: Briefcase },
                                { label: "Área", value: currentVehicle.area, icon: Building },
                              ].map(({ label, value, icon: Icon }) => (
                                <div
                                  key={label}
                                  className="flex justify-between items-center p-2.5 sm:p-3 bg-white rounded-xl shadow-sm"
                                >
                                  <div className="flex items-center min-w-0">
                                    <Icon className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                                    <span className="text-gray-600 text-sm">{label}:</span>
                                  </div>
                                  <span className="font-semibold text-gray-800 text-sm ml-2 text-right">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tab de Conductor */}
                      {activeTab === "conductor" && (
                        <div className="space-y-3 sm:space-y-4 animate-fade-in">
                          {currentVehicle.conductor ? (
                            <>
                              <div className="text-center mb-4 sm:mb-6">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                                  {currentVehicle.conductor.name}
                                </h3>
                                <p className="text-gray-500 text-sm">ID: {currentVehicle.conductor.id}</p>
                              </div>

                              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                                  </div>
                                  Datos del Conductor
                                </h3>
                                <div className="space-y-2 sm:space-y-3">
                                  <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-600 text-sm">Nombre:</span>
                                    <span className="font-semibold text-gray-800 text-sm ml-2 text-right">
                                      {currentVehicle.conductor.name}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-600 text-sm">ID:</span>
                                    <span className="font-mono text-sm text-gray-800 ml-2">
                                      {currentVehicle.conductor.id}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-8 sm:py-12">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                              </div>
                              <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">
                                Sin Conductor Asignado
                              </h3>
                              <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed px-4">
                                Este vehículo no tiene un conductor asignado actualmente.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tab de Detalles */}
                      {activeTab === "detalles" && (
                        <div className="space-y-3 sm:space-y-4 animate-fade-in">
                          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                              </div>
                              Información Técnica
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 text-sm">ID del Sistema:</span>
                                <span className="font-mono text-xs text-gray-800 bg-gray-200 px-2 py-1 rounded ml-2">
                                  {currentVehicle.id.slice(0, 8)}...
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 text-sm">Fecha de Creación:</span>
                                <span className="font-semibold text-gray-800 text-xs sm:text-sm ml-2 text-right">
                                  {new Date(currentVehicle.createdAt).toLocaleString("es-CO")}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 sm:p-5 border border-green-200">
                            <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-3 sm:mb-4 flex items-center">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-200 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                                <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-700" />
                              </div>
                              Resumen Laboral
                            </h3>
                            <div className="space-y-2 sm:space-y-3">
                              {[
                                { label: "Origen", value: currentVehicle.origen },
                                { label: "Cargo", value: currentVehicle.cargo },
                                { label: "Área", value: currentVehicle.area },
                              ].map(({ label, value }) => (
                                <div
                                  key={label}
                                  className="flex justify-between items-center p-2.5 sm:p-3 bg-white rounded-xl shadow-sm"
                                >
                                  <span className="text-gray-600 text-sm">{label}:</span>
                                  <span className="font-semibold text-gray-800 text-sm ml-2 text-right">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer con botones optimizado para móviles */}
                    <div className="border-t border-gray-200 p-3 sm:p-4 bg-white">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button
                          onClick={handleNewSearch}
                          className="flex-1 h-10 sm:h-12 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Nueva Búsqueda
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsModalOpen(false)}
                          className="flex-1 h-10 sm:h-12 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-300 text-sm sm:text-base"
                        >
                          Cerrar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  )
}

export default VehicleVerificationScreen
