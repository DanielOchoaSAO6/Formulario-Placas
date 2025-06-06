import { useState, useEffect } from "react";
import { LogOut, Users, Search, Clock, TrendingUp, Filter, Calendar, BarChart3, Eye, Download, RefreshCw, ChartBar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import * as XLSX from 'xlsx';

interface AdminDashboardProps {
  userData: { cedula: string; name: string; isAdmin?: boolean } | null;
  onLogout: () => void;
}

interface SearchRecord {
  id: string;
  userId: string;
  userName: string;
  plateNumber: string;
  searchTime: string;
  exitTime: string | null;
  vehicleInfo: {
    owner: string;
    brand: string;
    model: string;
    year: string;
    status: string;
  };
  sessionDuration: number;
}

const COLORS = ['#3AB570', '#4ade80', '#16a34a', '#22c55e', '#15803d', '#059669', '#047857'];

const chartConfig = {
  searches: {
    label: "Búsquedas",
    color: "#3AB570",
  },
  users: {
    label: "Usuarios",
    color: "#4ade80",
  },
  sessions: {
    label: "Sesiones",
    color: "#16a34a",
  },
};

const AdminDashboard = ({ userData, onLogout }: AdminDashboardProps) => {
  const [searchRecords, setSearchRecords] = useState<SearchRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SearchRecord[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  // Nuevos filtros para gráficas
  const [userActivityPeriod, setUserActivityPeriod] = useState("today");
  const [hourlyActivityDate, setHourlyActivityDate] = useState<Date>(new Date());
  const [hourlyStartHour, setHourlyStartHour] = useState("0");
  const [hourlyEndHour, setHourlyEndHour] = useState("23");
  const [platesSearchPeriod, setPlatesSearchPeriod] = useState("today");
  
  const { toast } = useToast();

  // Datos simulados extendidos con más fechas
  useEffect(() => {
    const mockData: SearchRecord[] = [
      {
        id: "1",
        userId: "1234567890",
        userName: "María González",
        plateNumber: "ABC123",
        searchTime: "2024-06-04 09:15:23",
        exitTime: "2024-06-04 09:25:10",
        vehicleInfo: {
          owner: "Juan Carlos Mendoza",
          brand: "Toyota",
          model: "Corolla",
          year: "2020",
          status: "Activo"
        },
        sessionDuration: 10
      },
      {
        id: "2",
        userId: "0987654321",
        userName: "Juan Pérez",
        plateNumber: "XYZ789",
        searchTime: "2024-06-04 10:30:15",
        exitTime: "2024-06-04 10:45:32",
        vehicleInfo: {
          owner: "Ana María López",
          brand: "Chevrolet",
          model: "Spark",
          year: "2019",
          status: "Activo"
        },
        sessionDuration: 15
      },
      {
        id: "3",
        userId: "1122334455",
        userName: "Ana Rodríguez",
        plateNumber: "DEF456",
        searchTime: "2024-06-04 11:00:45",
        exitTime: null,
        vehicleInfo: {
          owner: "Carlos Eduardo Ruiz",
          brand: "Nissan",
          model: "Sentra",
          year: "2021",
          status: "Bloqueado"
        },
        sessionDuration: 0
      },
      {
        id: "4",
        userId: "1234567890",
        userName: "María González",
        plateNumber: "GHI789",
        searchTime: "2024-06-04 14:22:10",
        exitTime: "2024-06-04 14:28:55",
        vehicleInfo: {
          owner: "Luis Alberto Sánchez",
          brand: "Honda",
          model: "Civic",
          year: "2022",
          status: "Activo"
        },
        sessionDuration: 7
      },
      {
        id: "5",
        userId: "0987654321",
        userName: "Juan Pérez",
        plateNumber: "JKL012",
        searchTime: "2024-06-04 16:10:33",
        exitTime: "2024-06-04 16:35:18",
        vehicleInfo: {
          owner: "Patricia Elena Vega",
          brand: "Kia",
          model: "Rio",
          year: "2018",
          status: "Activo"
        },
        sessionDuration: 25
      },
      {
        id: "6",
        userId: "1122334455",
        userName: "Ana Rodríguez",
        plateNumber: "MNO345",
        searchTime: "2024-06-04 17:15:20",
        exitTime: "2024-06-04 17:22:45",
        vehicleInfo: {
          owner: "Roberto Silva",
          brand: "Ford",
          model: "Focus",
          year: "2020",
          status: "Activo"
        },
        sessionDuration: 7
      },
      {
        id: "7",
        userId: "1234567890",
        userName: "María González",
        plateNumber: "PQR678",
        searchTime: "2024-06-04 18:30:12",
        exitTime: "2024-06-04 18:45:30",
        vehicleInfo: {
          owner: "Carmen Delgado",
          brand: "Mazda",
          model: "CX-5",
          year: "2021",
          status: "Activo"
        },
        sessionDuration: 15
      },
      // Datos adicionales para diferentes fechas
      {
        id: "8",
        userId: "1234567890",
        userName: "María González",
        plateNumber: "ABC123",
        searchTime: "2024-06-03 09:15:23",
        exitTime: "2024-06-03 09:25:10",
        vehicleInfo: {
          owner: "Juan Carlos Mendoza",
          brand: "Toyota",
          model: "Corolla",
          year: "2020",
          status: "Activo"
        },
        sessionDuration: 10
      },
      {
        id: "9",
        userId: "0987654321",
        userName: "Juan Pérez",
        plateNumber: "STU901",
        searchTime: "2024-06-02 15:30:15",
        exitTime: "2024-06-02 15:45:32",
        vehicleInfo: {
          owner: "Carlos Ruiz",
          brand: "Volkswagen",
          model: "Jetta",
          year: "2021",
          status: "Activo"
        },
        sessionDuration: 15
      }
    ];
    
    setSearchRecords(mockData);
    setFilteredRecords(mockData);
  }, []);

  // Función para filtrar datos por período
  const getFilteredDataByPeriod = (period: string, targetDate?: Date) => {
    const now = targetDate || new Date();
    let startPeriod: Date;
    let endPeriod: Date;

    switch (period) {
      case "today":
        startPeriod = startOfDay(now);
        endPeriod = endOfDay(now);
        break;
      case "week":
        startPeriod = startOfWeek(now);
        endPeriod = endOfWeek(now);
        break;
      case "month":
        startPeriod = startOfMonth(now);
        endPeriod = endOfMonth(now);
        break;
      case "7days":
        startPeriod = subDays(now, 7);
        endPeriod = now;
        break;
      case "30days":
        startPeriod = subDays(now, 30);
        endPeriod = now;
        break;
      default:
        return searchRecords;
    }

    return searchRecords.filter(record => {
      const recordDate = new Date(record.searchTime);
      return recordDate >= startPeriod && recordDate <= endPeriod;
    });
  };

  // Datos filtrados para actividad de usuario
  const filteredUserActivityData = () => {
    const filtered = getFilteredDataByPeriod(userActivityPeriod);
    return Object.entries(
      filtered.reduce((acc, record) => {
        if (!acc[record.userName]) {
          acc[record.userName] = 0;
        }
        acc[record.userName]++;
        return acc;
      }, {} as Record<string, number>)
    )
    .sort(([,a], [,b]) => b - a)
    .map(([name, searches]) => ({ name, searches, fill: COLORS[Math.floor(Math.random() * COLORS.length)] }));
  };

  // Datos filtrados para placas más buscadas
  const filteredPlatesData = () => {
    const filtered = getFilteredDataByPeriod(platesSearchPeriod);
    return Object.entries(
      filtered.reduce((acc, record) => {
        acc[record.plateNumber] = (acc[record.plateNumber] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
    .sort(([,a], [,b]) => b - a)
    .slice(0, 7)
    .map(([plate, count], index) => ({ 
      plate, 
      count, 
      fill: COLORS[index % COLORS.length],
      percentage: 0 // Se calculará después
    }))
    .map((item, _, array) => {
      const total = array.reduce((sum, item) => sum + item.count, 0);
      return { ...item, percentage: ((item.count / total) * 100).toFixed(1) };
    });
  };

  // Datos filtrados para actividad por hora
  const filteredHourlyData = () => {
    const dayStart = startOfDay(hourlyActivityDate);
    const dayEnd = endOfDay(hourlyActivityDate);
    
    const filtered = searchRecords.filter(record => {
      const recordDate = new Date(record.searchTime);
      return recordDate >= dayStart && recordDate <= dayEnd;
    });

    const hourlyData = filtered.reduce((acc, record) => {
      const hour = new Date(record.searchTime).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const startHour = parseInt(hourlyStartHour);
    const endHour = parseInt(hourlyEndHour);

    return Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i;
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        searches: hourlyData[hour] || 0
      };
    });
  };

  // Filtrar registros con fechas
  useEffect(() => {
    let filtered = searchRecords;

    if (searchFilter) {
      filtered = filtered.filter(record => 
        record.userName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        record.plateNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
        record.vehicleInfo.owner.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.searchTime);
        return recordDate >= startDate && recordDate <= endDate;
      });
    } else if (startDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.searchTime);
        return recordDate >= startDate;
      });
    } else if (endDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.searchTime);
        return recordDate <= endDate;
      });
    }

    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter(record => record.exitTime === null);
      } else if (statusFilter === "completed") {
        filtered = filtered.filter(record => record.exitTime !== null);
      }
    }

    setFilteredRecords(filtered);
  }, [searchFilter, startDate, endDate, statusFilter, searchRecords]);

  // Estadísticas
  const totalSearches = searchRecords.length;
  const uniqueUsers = new Set(searchRecords.map(r => r.userId)).size;
  const activeSessions = searchRecords.filter(r => r.exitTime === null).length;
  const averageSessionTime = searchRecords
    .filter(r => r.exitTime !== null)
    .reduce((acc, r) => acc + r.sessionDuration, 0) / 
    searchRecords.filter(r => r.exitTime !== null).length || 0;

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Datos actualizados",
        description: "La información ha sido actualizada exitosamente",
      });
    }, 1000);
  };

  const handleExportToExcel = () => {
    try {
      // Preparar datos para Excel
      const excelData = filteredRecords.map(record => ({
        'Usuario': record.userName,
        'Cédula': record.userId,
        'Placa Buscada': record.plateNumber,
        'Propietario del Vehículo': record.vehicleInfo.owner,
        'Marca': record.vehicleInfo.brand,
        'Modelo': record.vehicleInfo.model,
        'Año': record.vehicleInfo.year,
        'Estado del Vehículo': record.vehicleInfo.status,
        'Hora de Entrada': record.searchTime,
        'Hora de Salida': record.exitTime || 'En línea',
        'Duración (minutos)': record.exitTime ? record.sessionDuration : 'N/A'
      }));

      // Crear libro de trabajo
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Registros de Búsqueda");

      // Generar archivo
      const fileName = `registros_busqueda_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Exportación exitosa",
        description: `Archivo ${fileName} descargado correctamente`,
      });
    } catch (error) {
      toast({
        title: "Error en exportación",
        description: "No se pudo exportar el archivo",
        variant: "destructive"
      });
    }
  };

  const clearFilters = () => {
    setSearchFilter("");
    setStartDate(undefined);
    setEndDate(undefined);
    setStatusFilter("all");
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header del Dashboard */}
      <div className="glass-strong rounded-[24px] p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center animate-pulse-gentle">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 animate-fade-in">
                  Panel de Administración
                </h1>
                <p className="text-gray-600 text-sm sm:text-base animate-fade-in" style={{animationDelay: '0.2s'}}>
                  Bienvenido, {userData?.name}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-primary-500 hover:bg-primary-600 text-white rounded-[16px] px-4 py-2 h-auto transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            
            <Button
              onClick={handleExportToExcel}
              variant="outline"
              className="border-primary-200 text-primary-700 hover:bg-primary-50 rounded-[16px] px-4 py-2 h-auto transition-all duration-300 hover:scale-105"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 rounded-[16px] px-4 py-2 h-auto transition-all duration-300 hover:scale-105"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Indicadores Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="glass rounded-[20px] border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Search className="h-4 w-4 mr-2 text-primary-500" />
              Búsquedas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-700">{totalSearches}</div>
            <p className="text-xs text-gray-500">Hoy</p>
          </CardContent>
        </Card>

        <Card className="glass rounded-[20px] border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{animationDelay: '0.1s'}}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2 text-emerald-500" />
              Usuarios Únicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{uniqueUsers}</div>
            <p className="text-xs text-gray-500">Activos hoy</p>
          </CardContent>
        </Card>

        <Card className="glass rounded-[20px] border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-orange-500" />
              Sesiones Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{activeSessions}</div>
            <p className="text-xs text-gray-500">En línea ahora</p>
          </CardContent>
        </Card>

        <Card className="glass rounded-[20px] border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{animationDelay: '0.3s'}}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-teal-500" />
              Tiempo Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">{averageSessionTime.toFixed(1)}m</div>
            <p className="text-xs text-gray-500">Por sesión</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Mejorados con Filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Actividad por Usuario con Filtros */}
        <Card className="glass-strong rounded-[24px] border-0 shadow-xl animate-fade-in" style={{animationDelay: '0.4s'}}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
                  <ChartBar className="h-5 w-5 mr-2 text-primary-500" />
                  Actividad por Usuario
                </CardTitle>
                <CardDescription>Búsquedas realizadas por cada usuario</CardDescription>
              </div>
              <Select value={userActivityPeriod} onValueChange={setUserActivityPeriod}>
                <SelectTrigger className="rounded-[12px] border-primary-200 glass w-full sm:w-auto min-w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="7days">Últimos 7 días</SelectItem>
                  <SelectItem value="30days">Últimos 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredUserActivityData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="searches" fill="#3AB570" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Placas Más Buscadas Mejorado */}
        <Card className="glass-strong rounded-[24px] border-0 shadow-xl animate-fade-in" style={{animationDelay: '0.5s'}}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" />
                  Placas Más Buscadas
                </CardTitle>
                <CardDescription>Top placas con más consultas</CardDescription>
              </div>
              <Select value={platesSearchPeriod} onValueChange={setPlatesSearchPeriod}>
                <SelectTrigger className="rounded-[12px] border-primary-200 glass w-full sm:w-auto min-w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="7days">Últimos 7 días</SelectItem>
                  <SelectItem value="30days">Últimos 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="w-full lg:w-1/2">
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={filteredPlatesData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        label={false}
                      >
                        {filteredPlatesData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 shadow-lg rounded-lg border">
                                <p className="font-semibold">{data.plate}</p>
                                <p className="text-sm text-gray-600">{data.count} búsquedas</p>
                                <p className="text-sm text-gray-600">{data.percentage}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="w-full lg:w-1/2 space-y-2">
                {filteredPlatesData().map((item, index) => (
                  <div key={item.plate} className="flex items-center justify-between p-2 rounded-lg glass">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.fill }}
                      ></div>
                      <span className="font-mono font-semibold text-primary-700">{item.plate}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">{item.count}</div>
                      <div className="text-xs text-gray-500">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Búsquedas por Hora Mejorado con Filtros */}
        <Card className="glass-strong rounded-[24px] border-0 shadow-xl lg:col-span-2 animate-fade-in" style={{animationDelay: '0.6s'}}>
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-teal-500" />
                  Actividad por Hora del Día
                </CardTitle>
                <CardDescription>Distribución de búsquedas a lo largo del día</CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-[12px] border-primary-200 glass justify-start text-left font-normal w-full sm:w-[180px]"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(hourlyActivityDate, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={hourlyActivityDate}
                      onSelect={(date) => date && setHourlyActivityDate(date)}
                      initialFocus
                      className="rounded-[16px] pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <div className="flex gap-2">
                  <Select value={hourlyStartHour} onValueChange={setHourlyStartHour}>
                    <SelectTrigger className="rounded-[12px] border-primary-200 glass w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <span className="self-center text-gray-500">-</span>
                  
                  <Select value={hourlyEndHour} onValueChange={setHourlyEndHour}>
                    <SelectTrigger className="rounded-[12px] border-primary-200 glass w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredHourlyData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="searches" 
                    stroke="#3AB570" 
                    fill="url(#colorGradient)" 
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3AB570" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3AB570" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Registros */}
      <Card className="glass-strong rounded-[24px] border-0 shadow-xl animate-fade-in" style={{animationDelay: '0.7s'}}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-primary-500" />
                Registro de Búsquedas
              </CardTitle>
              <CardDescription>Historial detallado de todas las consultas realizadas</CardDescription>
            </div>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-[12px] px-3 py-1 text-sm"
            >
              <Filter className="h-4 w-4 mr-1" />
              Limpiar Filtros
            </Button>
          </div>
          
          {/* Controles de Filtro */}
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por usuario, placa o propietario..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="rounded-[16px] border-primary-200 glass"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-[16px] border-primary-200 glass w-full sm:w-auto min-w-[150px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Sesiones Activas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">Fecha Inicio</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-[16px] border-primary-200 glass justify-start text-left font-normal w-full sm:w-[200px]"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="rounded-[16px] pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">Fecha Fin</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-[16px] border-primary-200 glass justify-start text-left font-normal w-full sm:w-[200px]"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="rounded-[16px] pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-[16px] overflow-hidden glass">
            <Table>
              <TableHeader>
                <TableRow className="border-primary-200">
                  <TableHead className="font-semibold text-gray-700">Usuario</TableHead>
                  <TableHead className="font-semibold text-gray-700">Placa Buscada</TableHead>
                  <TableHead className="font-semibold text-gray-700">Propietario</TableHead>
                  <TableHead className="font-semibold text-gray-700">Hora Entrada</TableHead>
                  <TableHead className="font-semibold text-gray-700">Hora Salida</TableHead>
                  <TableHead className="font-semibold text-gray-700">Duración</TableHead>
                  <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record, index) => (
                  <TableRow 
                    key={record.id} 
                    className="border-primary-100 hover:bg-primary-50/50 transition-all duration-200 animate-fade-in"
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    <TableCell className="font-medium text-gray-800">{record.userName}</TableCell>
                    <TableCell className="font-mono text-primary-700 font-semibold">{record.plateNumber}</TableCell>
                    <TableCell className="text-gray-700">{record.vehicleInfo.owner}</TableCell>
                    <TableCell className="text-gray-600 text-sm">{record.searchTime}</TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {record.exitTime || (
                        <span className="text-green-600 font-medium flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          En línea
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {record.exitTime ? `${record.sessionDuration}m` : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                        record.vehicleInfo.status === 'Activo' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}>
                        {record.vehicleInfo.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500 animate-fade-in">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No se encontraron registros</p>
              <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
