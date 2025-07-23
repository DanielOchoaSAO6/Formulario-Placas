"use client"

import { useState } from "react"
import { StatsCards } from "./stats-cards"
import { UserActivityChart } from "./charts/user-activity-chart"
import { PlatesChart } from "./charts/plates-chart"
import { HourlyActivityChart } from "./charts/hourly-activity-chart"
import { useChartData } from "@/hooks/use-chart-data"
import type { SearchRecord } from "@/types/dashboard-types"

interface DashboardContentWithChartsProps {
  totalSearches: number
  uniqueUsers: number
  activeSessions: number
  averageSessionTime: number
  searchRecords: SearchRecord[]
}

export function DashboardContentWithCharts({
  totalSearches,
  uniqueUsers,
  activeSessions,
  averageSessionTime,
  searchRecords,
}: DashboardContentWithChartsProps) {
  const [userActivityPeriod, setUserActivityPeriod] = useState("today")
  const [platesSearchPeriod, setPlatesSearchPeriod] = useState("today")
  const [hourlyActivityDate, setHourlyActivityDate] = useState<Date>(new Date())
  const [hourlyStartHour, setHourlyStartHour] = useState("0")
  const [hourlyEndHour, setHourlyEndHour] = useState("23")

  const { getFilteredUserActivityData, getFilteredPlatesData, getFilteredHourlyData } = useChartData(searchRecords)

  const userActivityData = getFilteredUserActivityData(userActivityPeriod)
  const platesData = getFilteredPlatesData(platesSearchPeriod)
  const hourlyData = getFilteredHourlyData(hourlyActivityDate, hourlyStartHour, hourlyEndHour)

  return (
    <div className="space-y-6">
      <StatsCards
        totalSearches={totalSearches}
        uniqueUsers={uniqueUsers}
        activeSessions={activeSessions}
        averageSessionTime={averageSessionTime}
      />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserActivityChart data={userActivityData} onPeriodChange={setUserActivityPeriod} period={userActivityPeriod} />

        <PlatesChart data={platesData} onPeriodChange={setPlatesSearchPeriod} period={platesSearchPeriod} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <HourlyActivityChart
          data={hourlyData}
          date={hourlyActivityDate}
          startHour={hourlyStartHour}
          endHour={hourlyEndHour}
          onDateChange={setHourlyActivityDate}
          onStartHourChange={setHourlyStartHour}
          onEndHourChange={setHourlyEndHour}
        />
      </div>
    </div>
  )
}
