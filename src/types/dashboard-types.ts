export interface AdminDashboardProps {
    userData: { 
      id?: string;
      cedula?: string; 
      name: string; 
      isAdmin?: boolean;
      role?: string;
      email?: string;
    } | null
    onLogout: () => void
  }
  
  export interface SearchRecord {
    id: string
    userId: string
    userName: string
    plateNumber: string
    searchTime: string
    exitTime: string | null
    vehicleInfo: {
      owner: string
      brand: string
      model: string
      year: string
      status: string
    }
    sessionDuration: number
    rawData?: {
      createdAt?: string
      encontrado?: boolean
    }
  }
  
  export interface User {
    id: string
    name: string
    email: string
    role: "admin" | "user" | "guest"
    status: "active" | "inactive" | "pending"
    lastLogin: string | null
    createdAt: string
    phone?: string
    department?: string
    permissions: string[]
    avatar?: string
  }
  