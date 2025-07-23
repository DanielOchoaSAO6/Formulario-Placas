import { subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import type { SearchRecord } from "@/types/dashboard-types"
import { GREEN_COLORS } from "@/constants/dashboard-constants"

export function useChartData(searchRecords: SearchRecord[]) {
  // Función para filtrar datos por período
  const getFilteredDataByPeriod = (period: string, targetDate?: Date) => {
    const now = targetDate || new Date()
    let startPeriod: Date
    let endPeriod: Date

    switch (period) {
      case "today":
        startPeriod = startOfDay(now)
        endPeriod = endOfDay(now)
        break
      case "week":
        startPeriod = startOfWeek(now)
        endPeriod = endOfWeek(now)
        break
      case "month":
        startPeriod = startOfMonth(now)
        endPeriod = endOfMonth(now)
        break
      case "7days":
        startPeriod = subDays(now, 7)
        endPeriod = now
        break
      case "30days":
        startPeriod = subDays(now, 30)
        endPeriod = now
        break
      default:
        return searchRecords
    }

    return searchRecords.filter((record) => {
      const recordDate = new Date(record.searchTime)
      return recordDate >= startPeriod && recordDate <= endPeriod
    })
  }

  // Datos filtrados para actividad de usuario
  const getFilteredUserActivityData = (period: string) => {
    const filtered = getFilteredDataByPeriod(period)
    return Object.entries(
      filtered.reduce(
        (acc, record) => {
          if (!acc[record.userName]) {
            acc[record.userName] = 0
          }
          acc[record.userName]++
          return acc
        },
        {} as Record<string, number>,
      ),
    )
      .sort(([, a], [, b]) => b - a)
      .map(([name, searches]) => ({
        name,
        searches,
        fill: GREEN_COLORS[Math.floor(Math.random() * GREEN_COLORS.length)],
      }))
  }

  // Datos filtrados para placas más buscadas
  const getFilteredPlatesData = (period: string) => {
    const filtered = getFilteredDataByPeriod(period)
    return Object.entries(
      filtered.reduce(
        (acc, record) => {
          acc[record.plateNumber] = (acc[record.plateNumber] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7)
      .map(([plate, count], index) => ({
        plate,
        count,
        fill: GREEN_COLORS[index % GREEN_COLORS.length],
        percentage: 0, // Se calculará después
      }))
      .map((item, _, array) => {
        const total = array.reduce((sum, item) => sum + item.count, 0)
        return { ...item, percentage: ((item.count / total) * 100).toFixed(1) }
      })
  }

  // Datos filtrados para actividad por hora
  const getFilteredHourlyData = (date: Date, startHour: string, endHour: string) => {
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    const filtered = searchRecords.filter((record) => {
      const recordDate = new Date(record.searchTime)
      return recordDate >= dayStart && recordDate <= dayEnd
    })

    const hourlyData = filtered.reduce(
      (acc, record) => {
        const hour = new Date(record.searchTime).getHours()
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const startHourNum = Number.parseInt(startHour)
    const endHourNum = Number.parseInt(endHour)

    return Array.from({ length: endHourNum - startHourNum + 1 }, (_, i) => {
      const hour = startHourNum + i
      return {
        hour: `${hour.toString().padStart(2, "0")}:00`,
        searches: hourlyData[hour] || 0,
      }
    })
  }

  return {
    getFilteredUserActivityData,
    getFilteredPlatesData,
    getFilteredHourlyData,
  }
}
