"use client"

// Usando un enfoque que no genera warnings
export const DashboardStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes pulse-gentle {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slide-in-right {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes bounce-in {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .animate-gradient-shift {
      background-size: 400% 400%;
      animation: gradient-shift 15s ease infinite;
    }
    
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    .animate-pulse-gentle {
      animation: pulse-gentle 3s ease-in-out infinite;
    }
    
    .animate-fade-in {
      animation: fade-in 0.8s ease-out forwards;
    }
    
    .animate-slide-in-right {
      animation: slide-in-right 0.6s ease-out forwards;
    }
    
    .animate-bounce-in {
      animation: bounce-in 0.8s ease-out forwards;
    }
    
    .glass {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.18);
    }
    
    .glass-strong {
      background: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .hover-lift {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .hover-lift:hover {
      transform: translateY(-8px);
      box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.25);
    }
  `}} />
)
