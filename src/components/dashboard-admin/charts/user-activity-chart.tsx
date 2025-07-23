"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users } from "lucide-react"

interface UserActivityChartProps {
  data: Array<{ name: string; searches: number; fill: string }>
  onPeriodChange: (period: string) => void
  period: string
}

export function UserActivityChart({ data, onPeriodChange, period }: UserActivityChartProps) {
  return (
    <Card
      className="glass rounded-[20px] border-0 shadow-lg hover-lift animate-fade-in"
      style={{ animationDelay: "0.5s" }}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold text-emerald-700 flex items-center">
              <Users className="h-5 w-5 mr-2 text-emerald-500" />
              Actividad por Usuario
            </CardTitle>
            <CardDescription className="text-emerald-600">Búsquedas realizadas por cada usuario</CardDescription>
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
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
            <XAxis dataKey="name" stroke="#059669" fontSize={12} angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#059669" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #d1fae5",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar dataKey="searches" radius={[4, 4, 0, 0]} className="animate-bounce-in" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
