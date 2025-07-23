"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"

interface HourlyActivityChartProps {
  data: Array<{ hour: string; searches: number }>
  date: Date
  startHour: string
  endHour: string
  onDateChange: (date: Date) => void
  onStartHourChange: (hour: string) => void
  onEndHourChange: (hour: string) => void
}

export function HourlyActivityChart({
  data,
  date,
  startHour,
  endHour,
  onDateChange,
  onStartHourChange,
  onEndHourChange,
}: HourlyActivityChartProps) {
  return (
    <Card
      className="glass rounded-[20px] border-0 shadow-lg hover-lift animate-fade-in"
      style={{ animationDelay: "0.7s" }}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-emerald-700 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-emerald-500" />
          Actividad por Hora
        </CardTitle>
        <CardDescription className="text-emerald-600">Distribución de búsquedas durante el día</CardDescription>

        <div className="flex flex-wrap gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-emerald-700">
              Fecha
            </Label>
            <Input
              id="date"
              type="date"
              value={date.toISOString().split("T")[0]}
              onChange={(e) => onDateChange(new Date(e.target.value))}
              className="rounded-[12px] border-emerald-200 glass"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startHour" className="text-emerald-700">
              Hora inicio
            </Label>
            <Input
              id="startHour"
              type="number"
              min="0"
              max="23"
              value={startHour}
              onChange={(e) => onStartHourChange(e.target.value)}
              className="w-20 rounded-[12px] border-emerald-200 glass"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endHour" className="text-emerald-700">
              Hora fin
            </Label>
            <Input
              id="endHour"
              type="number"
              min="0"
              max="23"
              value={endHour}
              onChange={(e) => onEndHourChange(e.target.value)}
              className="w-20 rounded-[12px] border-emerald-200 glass"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              dataKey="searches"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
              className="animate-bounce-in"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
