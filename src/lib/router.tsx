import { createBrowserRouter } from 'react-router-dom';
import Index from '../pages/Index';
import NotFound from '../pages/NotFound';
import VehicleVerification from '../components/VehicleVerification';
import VehicleVerificationScreen from '../components/VehicleVerificationScreen';

// This function creates the router with the user data and logout handler
export const createAppRouter = (
  userData: { cedula: string; name: string } | null,
  handleLogout: () => void
) => {
  return createBrowserRouter(
    [
      {
        path: '/',
        element: <Index />
      },
      {
        path: '/verificar-vehiculo',
        element: <VehicleVerification />
      },
      {
        path: '/verificacion',
        element: userData ? (
          <VehicleVerificationScreen userData={userData} onLogout={handleLogout} />
        ) : (
          <Index />
        )
      },
      {
        path: '*',
        element: <NotFound />
      }
    ],
    {
      // Enable future flags to address the warnings
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true
      } as any // Use type assertion to bypass TypeScript errors
    }
  );
};
