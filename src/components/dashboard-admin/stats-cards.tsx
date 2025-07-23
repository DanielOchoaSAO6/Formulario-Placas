"use client"

import { Clock, Search, TrendingUp, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardsProps {
  totalSearches: number
  uniqueUsers: number
  activeSessions: number
  averageSessionTime: number
}

export function StatsCards({ totalSearches, uniqueUsers, activeSessions, averageSessionTime }: StatsCardsProps) {
  const stats = [
    {
      title: "Búsquedas Totales",
      value: totalSearches,
      subtitle: "Hoy",
      icon: Search,
      color: "emerald",
      delay: "0s",
    },
    {
      title: "Usuarios Únicos",
      value: uniqueUsers,
      subtitle: "Activos hoy",
      icon: Users,
      color: "green",
      delay: "0.1s",
    },
    {
      title: "Sesiones Activas",
      value: activeSessions,
      subtitle: "En línea ahora",
      icon: Clock,
      color: "emerald",
      delay: "0.2s",
    },
    {
      title: "Tiempo Promedio",
      value: `${averageSessionTime.toFixed(1)}m`,
      subtitle: "Por sesión",
      icon: TrendingUp,
      color: "green",
      delay: "0.3s",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const colorClass = stat.color === "emerald" ? "emerald" : "green"

        return (
          <Card
            key={stat.title}
            className="glass rounded-[20px] border-0 shadow-lg hover-lift animate-bounce-in group"
            style={{ animationDelay: stat.delay }}
          >
            <CardHeader className="pb-2">
              <CardTitle
                className={`text-sm font-medium text-${colorClass}-600 flex items-center group-hover:text-${colorClass}-700 transition-colors`}
              >
                <Icon className={`h-4 w-4 mr-2 text-${colorClass}-500 group-hover:scale-110 transition-transform`} />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-${colorClass}-700 group-hover:scale-105 transition-transform`}>
                {stat.value}
              </div>
              <p className={`text-xs text-${colorClass}-500`}>{stat.subtitle}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
