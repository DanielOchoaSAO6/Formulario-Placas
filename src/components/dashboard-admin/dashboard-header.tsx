"use client"

import { BarChart3, Download, LogOut, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AdminDashboardProps } from "@/types/dashboard-types"

interface DashboardHeaderProps {
  userData: AdminDashboardProps["userData"]
  onLogout: () => void
  onRefresh: () => void
  onExport: () => void
  isLoading: boolean
}

export function DashboardHeader({ userData, onLogout, onRefresh, onExport, isLoading }: DashboardHeaderProps) {
  return (
    <div className="glass-strong rounded-[24px] p-6 mb-6 relative overflow-hidden hover-lift animate-fade-in">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-3xl animate-float"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center animate-pulse-gentle shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-800 bg-clip-text text-transparent animate-fade-in">
                Panel de Administración
              </h1>
              <p
                className="text-emerald-600 text-sm sm:text-base animate-slide-in-right"
                style={{ animationDelay: "0.2s" }}
              >
                Bienvenido, {userData?.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 animate-slide-in-right" style={{ animationDelay: "0.4s" }}>
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-[16px] px-4 py-2 h-auto transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <Button
            onClick={onExport}
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-[16px] px-4 py-2 h-auto transition-all duration-300 hover:scale-105"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>

          <Button
            onClick={onLogout}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-[16px] px-4 py-2 h-auto transition-all duration-300 hover:scale-105"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
