
import { useState } from "react";
import { Car, UserCheck, ArrowLeft, Save, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { gql, useMutation } from "@apollo/client";

interface VehicleRegistrationScreenProps {
  userData: { cedula: string; name: string } | null;
  onBack: () => void;
}

// Definir la mutación GraphQL para crear vehículos
const CREATE_VEHICLE = gql`
  mutation CreateVehicle($input: CreateVehicleInput!) {
    createVehicle(input: $input) {
      id
      placa
      estado
      tipoVehiculo
      origen
      conductor {
        id
        name
      }
    }
  }
`;

const VehicleRegistrationScreen = ({ userData, onBack }: VehicleRegistrationScreenProps) => {
  const [placa, setPlaca] = useState("");
  const [cedula, setCedula] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Configurar la mutación GraphQL
  const [createVehicle] = useMutation(CREATE_VEHICLE, {
    onCompleted: (data) => {
      toast({
        title: "¡Vehículo registrado exitosamente!",
        description: `Placa ${data.createVehicle.placa} registrada para cédula ${cedula}`,
      });
      
      setIsSubmitting(false);
      
      // Limpiar formulario después del registro exitoso
      setPlaca("");
      setCedula("");
    },
    onError: (error) => {
      toast({
        title: "Error al registrar vehículo",
        description: error.message,
        variant: "destructive",
      });
      
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!placa.trim() || !cedula.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Llamar a la mutación GraphQL para crear el vehículo
      await createVehicle({
        variables: {
          input: {
            placa: placa.trim(),
            conductorId: cedula.trim(),
            estado: "ACTIVO",
            tipoVehiculo: "AUTOMOVIL",
            origen: "REGISTRO_WEB"
          }
        }
      });
      
      // La gestión de éxito se maneja en el callback onCompleted de la mutación
    } catch (error) {
      // Los errores se manejan en el callback onError de la mutación
      console.error("Error al registrar vehículo:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header con botón de regreso */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8 animate-fade-in">
          <Button
            onClick={onBack}
            variant="outline"
            className="rounded-full border-0 bg-white/70 backdrop-blur-lg shadow-lg hover:bg-white/80 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="backdrop-blur-lg bg-white/70 rounded-3xl shadow-xl border border-white/30 px-5 py-4 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              ¡Hola, {userData?.name}! 👋
            </h1>
            <p className="text-gray-600">Registra tu vehículo</p>
          </div>
        </div>

        {/* Tarjeta principal del formulario */}
        <div className="backdrop-blur-lg bg-white/70 rounded-4xl shadow-2xl border border-white/30 p-6 sm:p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mb-4 animate-bounce-gentle">
              <Car className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Registro de Vehículo</h2>
            <p className="text-gray-600">Completa la información para registrar tu vehículo</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de Placa */}
            <div className="space-y-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Car className="h-5 w-5 text-emerald-500 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <Input
                  type="text"
                  placeholder="Ej: ABC123"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                  className="pl-12 h-16 rounded-3xl border-0 bg-white/50 backdrop-blur-sm shadow-lg focus:bg-white/70 focus:shadow-xl transition-all duration-300 text-gray-800 placeholder:text-gray-500 text-center text-lg font-semibold"
                  disabled={isSubmitting}
                  required
                />
                <label className="absolute left-12 -top-2 px-2 text-xs font-medium text-emerald-600 bg-white/80 rounded-full transition-all duration-200">
                  Placa del Vehículo *
                </label>
              </div>
              
              <div className="flex items-center justify-center text-xs text-gray-500 mt-2">
                <Info className="h-3 w-3 mr-1" />
                Formato: 3 letras seguidas de 3 números
              </div>
            </div>

            {/* Campo de Cédula */}
            <div className="space-y-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserCheck className="h-5 w-5 text-blue-500 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <Input
                  type="text"
                  placeholder="Ej: 1234567890"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                  className="pl-12 h-16 rounded-3xl border-0 bg-white/50 backdrop-blur-sm shadow-lg focus:bg-white/70 focus:shadow-xl transition-all duration-300 text-gray-800 placeholder:text-gray-500 text-center text-lg font-semibold"
                  disabled={isSubmitting}
                  maxLength={10}
                  required
                />
                <label className="absolute left-12 -top-2 px-2 text-xs font-medium text-blue-600 bg-white/80 rounded-full transition-all duration-200">
                  Cédula del Propietario *
                </label>
              </div>
              
              <div className="flex items-center justify-center text-xs text-gray-500 mt-2">
                <Info className="h-3 w-3 mr-1" />
                Solo números, sin puntos ni espacios
              </div>
            </div>

            {/* Botón de envío */}
            <div className="pt-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-16 rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 border-0"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Registrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Save className="h-5 w-5" />
                    <span>Registrar Vehículo</span>
                  </div>
                )}
              </Button>
            </div>
          </form>

          {/* Información adicional */}
          <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 rounded-2xl border border-emerald-200/50 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Información importante</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Asegúrate de que la placa esté correctamente escrita</li>
                  <li>• La cédula debe corresponder al propietario del vehículo</li>
                  <li>• Una vez registrado, podrás verificarlo en el sistema</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleRegistrationScreen;
