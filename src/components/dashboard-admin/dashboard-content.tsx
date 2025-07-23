"use client"

import { PieChart, Car, BarChart, LineChart, Users, Clock } from "lucide-react"
import { StatsCards } from "./stats-cards"
import { SearchLogsTable } from "./search-logs-table"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { GREEN_COLORS } from "@/constants/dashboard-constants"
import type { SearchRecord } from "@/types/dashboard-types"

interface DashboardContentProps {
  totalSearches: number
  uniqueUsers: number
  activeSessions: number
  averageSessionTime: number
  searchRecords: SearchRecord[]
}

export function DashboardContent({
  totalSearches,
  uniqueUsers,
  activeSessions,
  averageSessionTime,
  searchRecords,
}: DashboardContentProps) {
  const [userActivityPeriod, setUserActivityPeriod] = useState("today")
  const [platesSearchPeriod, setPlatesSearchPeriod] = useState("today")

  // Gráfico de actividad por usuario
  const renderUserActivityChart = () => {
    // Asegurar que searchRecords existe y tiene elementos
    if (!searchRecords || searchRecords.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <Users className="h-12 w-12 text-emerald-300 mb-2" />
          <p className="text-emerald-600">No hay datos de usuarios disponibles</p>
        </div>
      )
    }

    console.log('Datos para gráfico de usuarios:', searchRecords)

    // Agrupar búsquedas por usuario y contar
    const userCounts = searchRecords.reduce((acc, record) => {
      // Asegurarse de que el nombre de usuario esté disponible
      const userName = record.userName || "Usuario desconocido"
      acc[userName] = (acc[userName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Convertir a array y ordenar por cantidad
    const sortedUsers = Object.entries(userCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Mostrar solo los top 10 usuarios más activos

    console.log('Usuarios ordenados para gráfico:', sortedUsers)

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={sortedUsers} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
          <XAxis dataKey="name" stroke="#059669" fontSize={12} />
          <YAxis stroke="#059669" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #d1fae5",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    )
  }

  // Gráfico de placas más buscadas
  const renderPlatesChart = () => {
    // Asegurar que searchRecords existe y tiene elementos
    if (!searchRecords || searchRecords.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <PieChart className="h-12 w-12 text-emerald-300 mb-2" />
          <p className="text-emerald-600">No hay datos de placas disponibles</p>
        </div>
      )
    }

    console.log('Datos para gráfico de placas:', searchRecords)

    // Agrupar búsquedas por placa y contar
    const plateCounts = searchRecords.reduce((acc, record) => {
      // Asegurarse de que el número de placa esté disponible
      const plateNumber = record.plateNumber || "Sin placa"
      acc[plateNumber] = (acc[plateNumber] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Convertir a array y ordenar por cantidad
    const sortedPlates = Object.entries(plateCounts)
      .map(([plate, count]) => ({ plate, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6) // Mostrar solo las top 6 placas más buscadas

    console.log('Placas ordenadas para gráfico:', sortedPlates)

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={sortedPlates}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ plate, count }) => `${plate} (${count})`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {sortedPlates.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={GREEN_COLORS[index % GREEN_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    )
  }

  // Gráfico de actividad por hora
  const renderHourlyActivityChart = () => {
    // Asegurar que searchRecords existe y tiene elementos
    if (!searchRecords || searchRecords.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <Clock className="h-12 w-12 text-emerald-300 mb-2" />
          <p className="text-emerald-600">No hay datos de actividad por hora disponibles</p>
        </div>
      )
    }

    console.log('Datos para gráfico de actividad por hora:', searchRecords)

    // Inicializar conteo por hora (0-23)
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0,
      label: `${i}:00`,
    }))

    // Contar búsquedas por hora
    searchRecords.forEach((record) => {
      try {
        if (record && record.searchTime) {
          const date = new Date(record.searchTime)
          if (!isNaN(date.getTime())) {
            const hour = date.getHours()
            hourlyData[hour].count++
          }
        }
      } catch (error) {
        console.error("Error procesando fecha:", error)
      }
    })

    console.log('Datos de actividad por hora procesados:', hourlyData)

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={hourlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
          <XAxis dataKey="hour" stroke="#059669" fontSize={12} />
          <YAxis stroke="#059669" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #d1fae5",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    )
  }

  // Gráfico de tasa de éxito
  const renderSuccessRateChart = () => {
    // Asegurar que searchRecords existe y tenga elementos
    if (!searchRecords || searchRecords.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <PieChart className="h-12 w-12 text-emerald-300 mb-2" />
          <p className="text-emerald-600">No hay datos de tasa de éxito disponibles</p>
        </div>
      )
    }

    console.log('Datos para gráfico de tasa de éxito:', searchRecords)

    // Calcular tasas de éxito y fracaso basados en el campo encontrado
    const total = searchRecords.length
    const successful = searchRecords.filter((r) => r.rawData?.encontrado === true).length
    const notFound = searchRecords.filter((r) => r.rawData?.encontrado === false).length
    const pending = total - successful - notFound

    // Calcular porcentajes con protección contra división por cero
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0
    const notFoundRate = total > 0 ? Math.round((notFound / total) * 100) : 0
    const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0

    const data = [
      { name: "Encontrados", value: successful, percentage: successRate, color: "#10b981" },
      { name: "No encontrados", value: notFound, percentage: notFoundRate, color: "#ef4444" },
      { name: "Pendientes", value: pending, percentage: pendingRate, color: "#3b82f6" },
    ]

    console.log('Datos procesados para gráfico de tasa de éxito:', data)

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="space-y-6">
      <StatsCards
        totalSearches={totalSearches || 0}
        uniqueUsers={uniqueUsers || 0}
        activeSessions={activeSessions || 0}
        averageSessionTime={isNaN(averageSessionTime) ? 0 : averageSessionTime}
      />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Actividad por Usuario */}
        <Card className="glass rounded-[20px] border-0 shadow-lg hover-lift animate-fade-in">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-semibold text-emerald-700 flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-emerald-500" />
                  Actividad por Usuario
                </CardTitle>
                <CardDescription className="text-emerald-600">Búsquedas realizadas por cada usuario</CardDescription>
              </div>
              <Select value={userActivityPeriod} onValueChange={setUserActivityPeriod}>
                <SelectTrigger className="w-32 rounded-[12px] border-emerald-200 glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="7days">Últimos 7 días</SelectItem>
                  <SelectItem value="30days">Últimos 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>{renderUserActivityChart()}</CardContent>
        </Card>

        {/* Gráfico de Placas Más Buscadas */}
        <Card className="glass rounded-[20px] border-0 shadow-lg hover-lift animate-fade-in">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-semibold text-emerald-700 flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-emerald-500" />
                  Placas Más Buscadas
                </CardTitle>
                <CardDescription className="text-emerald-600">Top placas con más consultas</CardDescription>
              </div>
              <Select value={platesSearchPeriod} onValueChange={setPlatesSearchPeriod}>
                <SelectTrigger className="w-32 rounded-[12px] border-emerald-200 glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="7days">Últimos 7 días</SelectItem>
                  <SelectItem value="30days">Últimos 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>{renderPlatesChart()}</CardContent>
        </Card>
      </div>

      {/* Gráfico de Actividad por Hora */}
      <Card className="glass rounded-[20px] border-0 shadow-lg hover-lift animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-emerald-700">Actividad por Hora</CardTitle>
            <CardDescription className="text-emerald-600">
              Distribución de búsquedas a lo largo del día
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>{renderHourlyActivityChart()}</CardContent>
      </Card>

      {/* Tabla de Logs de Búsquedas */}
      <SearchLogsTable searchRecords={searchRecords} />
    </div>
  )
}
