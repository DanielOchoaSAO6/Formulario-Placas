"use client"

import { LayoutDashboard, Settings, UserCog } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DashboardTabsProps {
  activeTab: string
  onTabChange: (value: string) => void
}

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="mb-6 animate-fade-in"
      style={{ animationDelay: "0.3s" }}
    >
      <TabsList className="grid grid-cols-3 max-w-md mx-auto bg-emerald-50/50 border border-emerald-100 rounded-[16px] p-1">
        <TabsTrigger
          value="dashboard"
          className="rounded-[12px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white transition-all duration-300"
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </TabsTrigger>
        <TabsTrigger
          value="users"
          className="rounded-[12px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white transition-all duration-300"
        >
          <UserCog className="h-4 w-4 mr-2" />
          Usuarios
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          className="rounded-[12px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white transition-all duration-300"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configuración
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
