
import { Car } from "lucide-react";

const AnimatedLogo = () => {
  return (
    <div className="relative inline-block group">
      {/* Logo principal con efectos mejorados */}
      <div className="w-24 h-24 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-[20px] flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-500 ease-out animate-glow">
        <Car className="h-12 w-12 text-white animate-pulse-gentle group-hover:animate-wiggle" />
        
        {/* Brillo interno */}
        <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-[16px] pointer-events-none"></div>
      </div>
      
      {/* Anillos decorativos mejorados */}
      <div className="absolute -inset-2 rounded-[24px] border-2 border-primary-300/50 animate-pulse opacity-60"></div>
      <div className="absolute -inset-4 rounded-[28px] border border-primary-200/30 animate-pulse-gentle" style={{animationDelay: '0.5s'}}></div>
      
      {/* Efectos de partículas */}
      <div className="absolute top-2 right-2 w-1 h-1 bg-white/80 rounded-full animate-pulse"></div>
      <div className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      
      {/* Sombra dinámica */}
      <div className="absolute -inset-3 bg-gradient-to-br from-primary-400/30 to-primary-600/30 rounded-[28px] blur-xl opacity-60 animate-pulse-gentle -z-10"></div>
      
      {/* Efecto de resplandor en hover */}
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out overflow-hidden"></div>
    </div>
  );
};

export default AnimatedLogo;
