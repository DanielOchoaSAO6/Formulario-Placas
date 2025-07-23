"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { SearchRecord } from "@/types/dashboard-types"

interface SearchLogsTableProps {
  searchRecords: SearchRecord[]
}

export function SearchLogsTable({ searchRecords = [] }: SearchLogsTableProps) {
  // Asegurar que searchRecords nunca sea undefined
  const safeRecords = searchRecords || []
  
  const [filteredRecords, setFilteredRecords] = useState<SearchRecord[]>([])
  const [searchFilter, setSearchFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SearchRecord
    direction: "ascending" | "descending"
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<SearchRecord | null>(null)

  const { toast } = useToast()

  // Filtrar registros
  useEffect(() => {
    let filtered = safeRecords

    if (searchFilter) {
      filtered = filtered.filter(
        (record) =>
          record.userName.toLowerCase().includes(searchFilter.toLowerCase()) ||
          record.userId.toLowerCase().includes(searchFilter.toLowerCase()) ||
          record.plateNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
          record.vehicleInfo.owner.toLowerCase().includes(searchFilter.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      if (statusFilter === "completed") {
        filtered = filtered.filter((record) => record.exitTime !== null)
      } else if (statusFilter === "active") {
        filtered = filtered.filter((record) => record.exitTime === null)
      } else if (statusFilter === "successful") {
        filtered = filtered.filter((record) => record.vehicleInfo.status === "Activo")
      } else if (statusFilter === "blocked") {
        filtered = filtered.filter((record) => record.vehicleInfo.status === "Bloqueado")
      }
    }

    if (dateFilter) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.searchTime).toISOString().split("T")[0]
        return recordDate === dateFilter
      })
    }

    // Aplicar ordenamiento
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    setFilteredRecords(filtered)
  }, [searchFilter, statusFilter, dateFilter, sortConfig, safeRecords])

  // Función para ordenar
  const requestSort = (key: keyof SearchRecord) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: keyof SearchRecord) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === "ascending" ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )
    }
    return null
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Logs actualizados",
        description: "Los registros de búsqueda han sido actualizados correctamente.",
      })
    }, 1000)
  }

  const handleExport = () => {
    toast({
      title: "Exportación exitosa",
      description: "Los logs han sido exportados correctamente.",
    })
  }

  const clearFilters = () => {
    setSearchFilter("")
    setStatusFilter("all")
    setDateFilter("")
    setSortConfig(null)
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getSearchStatus = (record: SearchRecord) => {
    if (record.exitTime === null) {
      return { status: "active", label: "En curso", color: "bg-blue-100 text-blue-700" }
    } else if (record.vehicleInfo.status === "Activo") {
      return { status: "successful", label: "Exitosa", color: "bg-green-100 text-green-700" }
    } else {
      return { status: "blocked", label: "Bloqueado", color: "bg-red-100 text-red-700" }
    }
  }

  return (
    <Card className="glass-strong rounded-[24px] border-0 shadow-xl animate-fade-in hover-lift">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-emerald-800 flex items-center">
              <Search className="h-5 w-5 mr-2 text-emerald-500" />
              Logs de Búsquedas
            </CardTitle>
            <CardDescription className="text-emerald-600">
              Historial detallado de todas las búsquedas realizadas en el sistema
            </CardDescription>
          </div>
          <div className="flex items-center space-x-3 animate-slide-in-right">
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-[16px] px-4 py-2 h-auto transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>

            <Button
              onClick={handleExport}
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-[16px] px-4 py-2 h-auto transition-all duration-300 hover:scale-105"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 animate-fade-in">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre, cédula, placa o propietario..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="rounded-[16px] border-emerald-200 glass hover:border-emerald-300 focus:border-emerald-400 transition-colors"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="rounded-[16px] border-emerald-200 glass w-full sm:w-auto min-w-[150px] hover:border-emerald-300 transition-colors">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">En curso</SelectItem>
              <SelectItem value="completed">Completadas</SelectItem>
              <SelectItem value="successful">Exitosas</SelectItem>
              <SelectItem value="blocked">Bloqueadas</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-[16px] border-emerald-200 glass w-full sm:w-auto hover:border-emerald-300 focus:border-emerald-400 transition-colors"
          />

          <Button
            onClick={clearFilters}
            variant="outline"
            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 rounded-[12px] px-3 py-1 text-sm transition-all duration-200"
          >
            <Filter className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
      </CardHeader>

    <CardContent>
      <div className="rounded-[16px] overflow-hidden glass animate-fade-in">
        <Table>
          <TableHeader>
            <TableHead className="bg-emerald-50/50">
              <TableRow>
                <TableHeader
                  className="cursor-pointer hover:bg-emerald-100/50 transition-colors"
                  onClick={() => requestSort("plateNumber")}
                >
                  <div className="flex items-center">
                    Placa {getSortIcon("plateNumber")}
                  </div>
                </TableHeader>
                <TableHeader
                  className="cursor-pointer hover:bg-emerald-100/50 transition-colors"
                  onClick={() => requestSort("userName")}
                >
                  <div className="flex items-center">
                    Usuario {getSortIcon("userName")}
                  </div>
                </TableHeader>
                <TableHeader
                  className="cursor-pointer hover:bg-emerald-100/50 transition-colors"
                  onClick={() => requestSort("searchTime")}
                >
                  <div className="flex items-center">
                    Hora de Inicio {getSortIcon("searchTime")}
                  </div>
                </TableHeader>
                <TableHeader
                  className="cursor-pointer hover:bg-emerald-100/50 transition-colors"
                  onClick={() => requestSort("exitTime")}
                >
                  <div className="flex items-center">
                    Hora de Fin {getSortIcon("exitTime")}
                  </div>
                </TableHeader>
                <TableHeader>Encontrado</TableHeader>
                <TableHeader>Estado</TableHeader>
                <TableHeader>Acciones</TableHeader>
              </TableRow>
            </TableHead>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record, index) => {
              const searchStatus = getSearchStatus(record)
              return (
                <TableRow
                  key={record.id}
                  className="border-emerald-100 hover:bg-emerald-50/50 transition-all duration-200 animate-fade-in group"
                  style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                >
                  <TableCell>
                    <div className="font-medium text-emerald-800 group-hover:text-emerald-900 transition-colors">
                      {record.plateNumber}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-emerald-700">{record.userName}</TableCell>
                  <TableCell className="text-emerald-600 text-sm">{formatDateTime(record.searchTime)}</TableCell>
                  <TableCell className="text-emerald-600 text-sm">
                    {record.exitTime ? formatDateTime(record.exitTime) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${record.rawData?.encontrado ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'} animate-fade-in`}
                    >
                      {record.rawData?.encontrado ? 'Encontrado' : 'No encontrado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${getSearchStatus(record).color} animate-fade-in`}
                    >
                      {getSearchStatus(record).label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-emerald-600 text-sm">{formatDateTime(record.searchTime)}</TableCell>
                  <TableCell className="text-emerald-600 text-sm">
                    {record.exitTime ? formatDateTime(record.exitTime) : "-"}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-full transition-all duration-200 hover:scale-110"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver detalles</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] rounded-[20px] border-emerald-200">
                        <DialogHeader>
                          <DialogTitle className="text-emerald-800 flex items-center">
                            <Search className="h-5 w-5 mr-2 text-emerald-500" />
                            Detalles de la Búsqueda
                          </DialogTitle>
                          <DialogDescription className="text-emerald-600">
                            Información completa del registro de búsqueda
                          </DialogDescription>
                        </DialogHeader>
                        {selectedRecord && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-emerald-700">Placa</label>
                                <p className="text-emerald-800">{selectedRecord.plateNumber}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-emerald-700">Usuario</label>
                                <p className="text-emerald-800">{selectedRecord.userName}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-emerald-700">Hora de Inicio</label>
                                <p className="text-emerald-800">{formatDateTime(selectedRecord.searchTime)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-emerald-700">Hora de Fin</label>
                                <p className="text-emerald-800">
                                  {selectedRecord.exitTime ? formatDateTime(selectedRecord.exitTime) : "En curso"}
                                </p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-emerald-700">Encontrado</label>
                              <p className="text-emerald-800">{selectedRecord.rawData?.encontrado ? 'Encontrado' : 'No encontrado'}</p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-8 text-emerald-500 animate-fade-in">
          <Search className="h-12 w-12 mx-auto mb-4 text-emerald-300 animate-float" />
          <p className="text-lg font-medium text-emerald-600">No se encontraron registros</p>
          <p className="text-sm text-emerald-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Resumen de estadísticas */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass rounded-[16px] p-4 text-center">
          <div className="text-2xl font-bold text-emerald-700">{(filteredRecords || []).length}</div>
          <div className="text-sm text-emerald-600">Total Registros</div>
        </div>
        <div className="glass rounded-[16px] p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">
            {(filteredRecords || []).filter((r) => r && r.exitTime === null).length}
          </div>
          <div className="text-sm text-blue-600">En Curso</div>
        </div>
        <div className="glass rounded-[16px] p-4 text-center">
          <div className="text-2xl font-bold text-green-700">
            {(filteredRecords || []).filter((r) => r && r.rawData?.encontrado === true).length}
          </div>
          <div className="text-sm text-green-600">Encontrados</div>
        </div>
        <div className="glass rounded-[16px] p-4 text-center">
          <div className="text-2xl font-bold text-red-700">
            {(filteredRecords || []).filter((r) => r && r.rawData?.encontrado === false).length}
          </div>
          <div className="text-sm text-red-600">No encontrados</div>
        </div>
      </div>
    </CardContent>
  </Card>
)}
