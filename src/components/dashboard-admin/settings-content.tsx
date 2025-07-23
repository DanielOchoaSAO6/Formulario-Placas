"use client"

import { Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SettingsContent() {
  return (
    <Card className="glass-strong rounded-[24px] border-0 shadow-xl animate-fade-in hover-lift">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-emerald-800 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-emerald-500" />
          Configuración del Sistema
        </CardTitle>
        <CardDescription className="text-emerald-600">
          Administra las configuraciones generales de la aplicación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-emerald-600">
          <Settings className="h-16 w-16 mx-auto mb-4 text-emerald-300 animate-float" />
          <p className="text-lg font-medium">Configuración del Sistema</p>
          <p className="text-sm text-emerald-500">Las opciones de configuración se implementarán aquí</p>
        </div>
      </CardContent>
    </Card>
  )
}
