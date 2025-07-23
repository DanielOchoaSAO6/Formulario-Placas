"use client"

import { useState, useEffect, useCallback } from "react"
import { gql, useLazyQuery, useMutation } from "@apollo/client"
import toast from "react-hot-toast"
import { Car, Search, CheckCircle, XCircle, LogOut, Plus, Info, User, Briefcase, Building, Shield, FileText, Tag, Calendar, MapPin, X, Clock, Phone, Mail, Car as IdCard, UserCheck, Star, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

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
  const [showGoogleForm, setShowGoogleForm] = useState(false)
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
        const vehicle = data?.getVehicleByPlaca
        const encontrado = !!vehicle
        
        // Verificar si el vehículo es EXTERNO (comparación más robusta)
        const estado = vehicle?.estado?.toString()?.trim()?.toUpperCase()
        const isExterno = estado === 'EXTERNO'
        
        // Debug: mostrar en consola para verificar
        console.log('Vehículo encontrado:', vehicle)
        console.log('Estado del vehículo:', estado)
        console.log('¿Es externo?', isExterno)
        
        // Registrar la verificación (siempre como encontrado para el log)
        logVehicleVerification({
          variables: {
            input: {
              placa: searchTerm.trim(),
              encontrado: encontrado, // Siempre true si existe en BD
              userId: userData?.cedula || null,
              startTime: searchStartTime?.toISOString(),
              endTime: endTime.toISOString()
            }
          }
        })
        
        if (encontrado && !isExterno) {
          // Vehículo encontrado y NO es externo
          setCurrentVehicle(vehicle)
          setIsModalOpen(true)
          toast.success(`Vehículo encontrado: ${vehicle.placa}`)
        } else {
          // Vehículo no encontrado O es EXTERNO - tratarlo como no encontrado
          setCurrentVehicle(null)
          setIsModalOpen(false)
          setHasSearched(true) // Asegurar que se muestre el mensaje de no encontrado
          toast.error("Vehículo no encontrado")
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
      setHasSearched(false)
    }
  }, [searchTerm])

  // Verificación adicional para vehículos externos
  useEffect(() => {
    if (currentVehicle && currentVehicle.estado?.toString()?.trim()?.toUpperCase() === 'EXTERNO') {
      console.log('Vehículo externo detectado, limpiando estado...')
      setCurrentVehicle(null)
      setIsModalOpen(false)
      setHasSearched(true)
    }
  }, [currentVehicle])

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
    setShowGoogleForm(true)
  }

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "activo":
        return "bg-emerald-500 text-white shadow-md"
      case "inactivo":
        return "bg-slate-400 text-white shadow-md"
      case "suspendido":
        return "bg-red-500 text-white shadow-md"
      default:
        return "bg-blue-500 text-white shadow-md"
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
  if (showGoogleForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 flex flex-col p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
            Registrar Vehículo No Encontrado
          </h2>
          <Button
            onClick={() => setShowGoogleForm(false)}
            variant="outline"
            className="rounded-xl border-2 border-red-300 text-red-600 hover:bg-red-50 transition-all duration-300 transform hover:scale-105"
          >
            <X className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full max-w-3xl h-[80vh]">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSfWqcB3sGVS0xw3EXBxYfCiej0brr64oratFMRWddnXZLtZGw/viewform?embedded=true"
              className="w-full h-full border-0"
              title="Formulario de registro de vehículo"
            >
              Cargando formulario...
            </iframe>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
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
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
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
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200px 100%;
          animation: shimmer 2s infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        
        .safe-area {
          padding-left: max(1rem, env(safe-area-inset-left));
          padding-right: max(1rem, env(safe-area-inset-right));
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .card-shadow {
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .glow-effect {
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 flex flex-col overflow-hidden">
        <div className="safe-area py-4 md:py-6">
          {/* Header con saludo y logout */}
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6 animate-fade-in">
              <div className="glass-effect rounded-2xl shadow-lg border border-green-100/50 px-4 sm:px-5 py-3 sm:py-4 w-full sm:w-auto transform hover:scale-[1.01] transition-all duration-300">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1">
                  ¡Hola, {userData?.name}! 👋
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">Verifica tu vehículo de forma rápida</p>
              </div>

              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="rounded-xl border border-green-200 glass-effect shadow-md hover:bg-green-50 hover:border-green-300 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-sm">Salir</span>
              </Button>
            </div>

            {/* Tarjeta principal de verificación */}
            <div className="glass-effect rounded-3xl shadow-xl border border-green-100/50 p-4 sm:p-6 md:p-8 animate-slide-up max-w-3xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-16 sm:w-18 md:w-20 h-16 sm:h-18 md:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-3 sm:mb-4 shadow-lg animate-float">
                  <Car className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                  Verificación de Vehículo
                </h2>
                <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed px-2">
                  Ingresa la placa de tu vehículo para verificar su registro en nuestro sistema
                </p>
              </div>

              {/* Campo de búsqueda */}
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
                    className="pl-11 sm:pl-12 h-14 sm:h-16 rounded-2xl border-2 border-green-200 bg-white shadow-lg focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all duration-300 text-gray-800 placeholder:text-gray-400 text-center text-lg sm:text-xl font-semibold tracking-wider hover:shadow-xl w-full glow-effect focus:glow-effect"
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

              {/* Resultado de vehículo no encontrado */}
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

            {/* Modal completamente rediseñado */}
            <Dialog
              open={isModalOpen && !!currentVehicle && currentVehicle.estado?.toString()?.trim()?.toUpperCase() !== 'EXTERNO'}
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
              <DialogContent className="w-[96vw] max-w-lg sm:max-w-xl md:max-w-2xl max-h-[95vh] overflow-hidden bg-transparent border-0 p-0 m-0 shadow-none">
                {currentVehicle && currentVehicle.estado?.toString()?.trim()?.toUpperCase() !== 'EXTERNO' && (
                  <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-scale-in max-h-[95vh] flex flex-col">
                    {/* Header Premium */}
                    <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 text-white p-6 sm:p-8 overflow-hidden">
                      {/* Elementos decorativos */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
                      <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
                      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-1000"></div>

                      {/* Botón de cerrar */}
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm z-10 group"
                      >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      </button>

                      <div className="relative z-10">
                        {/* Icono principal */}
                        <div className="flex justify-center mb-6">
                          <div className="relative">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                              <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Título y subtítulo */}
                        <div className="text-center mb-6">
                          <h2 className="text-2xl sm:text-3xl font-bold mb-2">¡Verificación Exitosa!</h2>
                          <p className="text-white/90 text-base mb-4">
                            Vehículo registrado y autorizado en el sistema
                          </p>

                          {/* Placa destacada con nuevo diseño */}
                          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 mb-4 max-w-xs mx-auto">
                            <div className="flex items-center justify-center space-x-2 mb-2">
                              <Tag className="w-4 h-4 text-white/80" />
                              <span className="text-white/80 text-sm font-medium">PLACA VEHÍCULO</span>
                            </div>
                            <div className="text-3xl sm:text-4xl font-black tracking-widest bg-white/20 rounded-xl py-2 px-4 border border-white/30">
                              {currentVehicle.placa}
                            </div>
                          </div>

                          {/* Estado con diseño mejorado */}
                          <div className="flex justify-center">
                            <Badge className={`${getStatusColor(currentVehicle.estado)} px-4 py-2 text-sm font-bold shadow-lg rounded-full`}>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(currentVehicle.estado)}
                                <span>{currentVehicle.estado.toUpperCase()}</span>
                              </div>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información principal mejorada */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-gray-50/30 scroll-smooth max-h-[60vh]">

                      {/* Grid de información del vehículo */}
                      <div className="grid gap-4 mb-6">
                        
                        {/* Información básica */}
                        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <Car className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Información del Vehículo</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { label: "Tipo", value: currentVehicle.tipoVehiculo, icon: Car, color: "blue" },
                              { label: "Placa", value: currentVehicle.placa, icon: Tag, color: "purple" },
                              { 
                                label: "Registro", 
                                value: new Date(currentVehicle.createdAt).toLocaleDateString("es-CO", {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }), 
                                icon: Calendar, 
                                color: "indigo" 
                              },
                            ].map(({ label, value, icon: Icon, color }) => (
                              <div key={label} className={`bg-${color}-50 rounded-xl p-3 border border-${color}-100`}>
                                <div className="flex items-center mb-2">
                                  <Icon className={`w-4 h-4 text-${color}-600 mr-2`} />
                                  <span className={`text-${color}-800 text-sm font-medium`}>{label}</span>
                                </div>
                                <p className="font-bold text-gray-800 text-sm truncate">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Información laboral */}
                        <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-5 border border-emerald-200 shadow-lg">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center mr-3">
                              <Briefcase className="w-5 h-5 text-emerald-700" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-800">Información Laboral</h3>
                          </div>
                          
                          <div className="space-y-3">
                            {[
                              { label: "Origen", value: currentVehicle.origen, icon: MapPin },
                              { label: "Cargo", value: currentVehicle.cargo, icon: Award },
                              { label: "Área", value: currentVehicle.area, icon: Building },
                            ].map(({ label, value, icon: Icon }) => (
                              <div key={label} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-emerald-100">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center min-w-0">
                                    <Icon className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                                    <span className="text-emerald-800 text-sm font-medium">{label}:</span>
                                  </div>
                                  <span className="font-bold text-gray-800 text-sm ml-2 text-right truncate">{value}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Información técnica */}
                        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-5 border border-slate-200 shadow-lg">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mr-3">
                              <FileText className="w-5 h-5 text-slate-700" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Información Técnica</h3>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="bg-white/80 rounded-xl p-3 shadow-sm border border-slate-100">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Tag className="w-4 h-4 text-slate-600 mr-2" />
                                  <span className="text-slate-800 text-sm font-medium">ID del Sistema:</span>
                                </div>
                                <span className="font-mono text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                                  {currentVehicle.id.slice(0, 8)}...
                                </span>
                              </div>
                            </div>
                            
                            <div className="bg-white/80 rounded-xl p-3 shadow-sm border border-slate-100">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 text-slate-600 mr-2" />
                                  <span className="text-slate-800 text-sm font-medium">Fecha de Registro:</span>
                                </div>
                                <span className="font-semibold text-gray-800 text-xs text-right">
                                  {new Date(currentVehicle.createdAt).toLocaleString("es-CO")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer rediseñado */}
                    <div className="border-t border-gray-200 p-4 sm:p-6 bg-white">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleNewSearch}
                          className="flex-1 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Nueva Búsqueda
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsModalOpen(false)}
                          className="flex-1 h-12 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-300 text-sm sm:text-base"
                        >
                          <X className="w-4 h-4 mr-2" />
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