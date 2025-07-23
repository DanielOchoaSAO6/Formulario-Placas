"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface PlatesChartProps {
  data: Array<{ plate: string; count: number; fill: string; percentage: string }>
  onPeriodChange: (period: string) => void
  period: string
}

export function PlatesChart({ data, onPeriodChange, period }: PlatesChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white/95 p-3 rounded-[12px] border border-emerald-200 shadow-lg">
          <p className="font-medium text-emerald-800">{`Placa: ${data.plate}`}</p>
          <p className="text-emerald-600">{`Búsquedas: ${data.count}`}</p>
          <p className="text-emerald-600">{`Porcentaje: ${data.percentage}%`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card
      className="glass rounded-[20px] border-0 shadow-lg hover-lift animate-fade-in"
      style={{ animationDelay: "0.6s" }}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold text-emerald-700 flex items-center">
              <Search className="h-5 w-5 mr-2 text-emerald-500" />
              Placas Más Buscadas
            </CardTitle>
            <CardDescription className="text-emerald-600">Top 7 placas con más consultas</CardDescription>
          </div>
          <Select value={period} onValueChange={onPeriodChange}>
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
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ plate, percentage }) => `${plate} (${percentage}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              className="animate-bounce-in"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
