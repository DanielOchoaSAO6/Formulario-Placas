"use client"

import { useState, useEffect } from "react"
import { Download, Filter, RefreshCw, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserForm } from "./user-form"
import { UsersTable } from "./users-table"
import type { User } from "@/types/dashboard-types"
import { useMutation, useQuery } from "@apollo/client"
import { GET_ALL_USERS, CREATE_USER, UPDATE_USER, DELETE_USER, CHANGE_PASSWORD } from "@/graphql/users"
import { title } from "process"

export function UserManagementSimple() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchFilter, setSearchFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User
    direction: "ascending" | "descending"
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()
  
  // Consulta GraphQL para obtener todos los usuarios
  const { loading, error, data, refetch } = useQuery(GET_ALL_USERS)
  
  // Mutaciones GraphQL para gestionar usuarios
  const [createUserMutation] = useMutation(CREATE_USER)
  const [updateUserMutation] = useMutation(UPDATE_USER)
  const [deleteUserMutation] = useMutation(DELETE_USER)
  const [changePasswordMutation] = useMutation(CHANGE_PASSWORD)

  // Cargar usuarios reales desde el backend
  useEffect(() => {
    if (loading) {
      setIsLoading(true);
      return;
    }
    
    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    if (data && data.users) {
      // Transformar los datos del backend al formato esperado por el componente
      const formattedUsers: User[] = data.users.map((user: any) => {
        // Mapear el rol del backend a uno de los valores permitidos en la interfaz User
        let userRole: "admin" | "user" | "guest" = "user";
        if (user.role === "ADMIN") {
          userRole = "admin";
        } else if (user.role === "GUEST") {
          userRole = "guest";
        }
        
        // Manejar la fecha con seguridad para evitar errores de fecha inválida
        let formattedDate = "";
        try {
          // Verificar si la fecha es válida antes de intentar formatearla
          if (user.createdAt && !isNaN(new Date(user.createdAt).getTime())) {
            formattedDate = new Date(user.createdAt).toISOString().split('T')[0];
          } else {
            formattedDate = new Date().toISOString().split('T')[0]; // Usar fecha actual como fallback
          }
        } catch (e) {
          formattedDate = new Date().toISOString().split('T')[0]; // Usar fecha actual como fallback
        }
        
        return {
          id: user.id,
          name: user.name || 'Sin nombre',
          email: user.email,
          role: userRole,
          status: "active", // Por defecto, asumimos que todos los usuarios están activos
          lastLogin: "", // No tenemos esta información del backend
          createdAt: formattedDate,
          department: "", // No tenemos esta información del backend
          permissions: userRole === "admin" ? ["users.manage", "reports.view", "settings.edit"] : ["reports.view"],
          avatar: "",
        };
      });
      
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
      setIsLoading(false);
    }
  }, [data, loading, error, toast])

  // Filtrar usuarios
  useEffect(() => {
    let filtered = users

    if (searchFilter) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          user.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
          user.department?.toLowerCase().includes(searchFilter.toLowerCase()),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
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

    setFilteredUsers(filtered)
  }, [searchFilter, roleFilter, statusFilter, sortConfig, users])

  // Función para ordenar
  const requestSort = (key: keyof User) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Función para actualizar un usuario
  const updateUser = async (updatedUser: any) => {
    try {
      // Asegurar que el role esté en mayúsculas para el backend
      const roleForBackend = updatedUser.role.toUpperCase();
      
      // Llamar a la mutación GraphQL para actualizar el usuario
      const { data } = await updateUserMutation({
        variables: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: roleForBackend,
        },
      });
      
      // Si se está cambiando la contraseña, realizar la mutación adicional
      if (updatedUser.changePassword && updatedUser.currentPassword && updatedUser.newPassword) {
        try {
          const passwordData = await changePasswordMutation({
            variables: {
              id: updatedUser.id,
              currentPassword: updatedUser.currentPassword,
              newPassword: updatedUser.newPassword
            }
          });
          
          if (passwordData && passwordData.data) {
            toast({
              title: "Contraseña actualizada",
              description: "La contraseña ha sido actualizada correctamente."
            });
          }
        } catch (passwordError) {
          toast({
            title: "Error al cambiar contraseña",
            description: `${passwordError instanceof Error ? passwordError.message : 'La contraseña actual podría ser incorrecta'}`,
            variant: "destructive",
          });
          // No interrumpimos el flujo si falla el cambio de contraseña
        }
      }
      
      if (data && data.updateUser) {
        // Actualizar el estado local de usuarios
        const updatedUsers = users.map((user) => {
          if (user.id === updatedUser.id) {
            // Asegurar que role sea uno de los valores permitidos
            let role: "admin" | "user" | "guest" = "user";
            const lowerRole = updatedUser.role.toLowerCase();
            
            if (lowerRole === "admin") {
              role = "admin";
            } else if (lowerRole === "guest") {
              role = "guest";
            }
            
            // Mantener la fecha original para evitar errores
            const createdAt = user.createdAt;
            
            return {
              ...user,
              name: updatedUser.name,
              email: updatedUser.email,
              role: role,
              createdAt: createdAt, // Mantener la fecha original
            };
          }
          return user;
        });
        
        setUsers(updatedUsers)
        
        toast({
          title: "Usuario actualizado",
          description: `El usuario ${updatedUser.name} ha sido actualizado correctamente.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo actualizar el usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para añadir un nuevo usuario
  const addUser = async (newUser: Omit<User, "id" | "createdAt">) => {
    try {
      // Llamar a la mutación GraphQL para crear el usuario
      const { data } = await createUserMutation({
        variables: {
          input: {
            email: newUser.email,
            password: "password123", // Contraseña temporal, debería ser cambiada por el usuario
            name: newUser.name
          }
        }
      });
      
      if (data && data.signup && data.signup.user) {
        const createdUser = data.signup.user
        
        // Formatear el usuario creado para el estado local
        // Asegurar que role sea uno de los valores permitidos
        const lowerRole = createdUser.role.toLowerCase();
        
        let role: "admin" | "user" | "guest" = "user";
        if (lowerRole === "admin") {
          role = "admin";
        } else if (lowerRole === "guest") {
          role = "guest";
        }

        // Crear una fecha segura para el nuevo usuario
        let formattedDate = "";
        try {
          formattedDate = new Date().toISOString().split("T")[0];
        } catch (e) {
          formattedDate = ""; // En caso de error, usar string vacío
        }

        const newUserForState: User = {
          id: createdUser.id,
          name: createdUser.name || 'Sin nombre',
          email: createdUser.email,
          role: role, // Usar el role normalizado
          status: "active",
          lastLogin: "",
          createdAt: formattedDate, // Fecha segura
          department: newUser.department || "",
          permissions: role === "admin" ? ["users.manage", "reports.view", "settings.edit"] : ["reports.view"],
          avatar: "",
          phone: newUser.phone || ""
        }
        
        setUsers([...users, newUserForState])
        
        toast({
          title: "Usuario añadido",
          description: `El usuario ${newUser.name} ha sido añadido correctamente.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo crear el usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para eliminar un usuario
  const deleteUser = async (userId: string) => {
    setIsLoading(true)
    try {
      const { data: deleteData } = await deleteUserMutation({
        variables: {
          id: userId
        }
      })
      
      if (deleteData && deleteData.deleteUser) {
        // Actualizar el estado local
        setUsers(users.filter((user) => user.id !== userId))
        
        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado correctamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar el usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para refrescar datos
  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await refetch()
      toast({
        title: "Datos actualizados",
        description: "La lista de usuarios ha sido actualizada correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudieron actualizar los datos: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para exportar datos
  const handleExport = () => {
    toast({
      title: "Exportación exitosa",
      description: "La lista de usuarios ha sido exportada correctamente.",
    })
  }

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchFilter("")
    setRoleFilter("all")
    setStatusFilter("all")
    setFilteredUsers(users)
  }
  
  // Función para eliminar usuarios con dominio @vehicar.com
  const deleteVehicarUsers = async () => {
    setIsLoading(true)
    try {
      // Filtrar usuarios con dominio @vehicar.com
      const vehicarUsers = users.filter(user => user.email.includes('@vehicar.com'))
      
      if (vehicarUsers.length === 0) {
        toast({
          title: "Información",
          description: "No se encontraron usuarios con dominio @vehicar.com",
        })
        setIsLoading(false)
        return
      }
      
      // Eliminar cada usuario con dominio @vehicar.com
      let deletedCount = 0
      for (const user of vehicarUsers) {
        try {
          await deleteUserMutation({
            variables: {
              id: user.id
            }
          })
          deletedCount++
        } catch (error) {
          console.error(`Error al eliminar usuario ${user.email}:`, error)
        }
      }
      
      // Refrescar la lista de usuarios
      await refetch()
      
      toast({
        title: "Usuarios eliminados",
        description: `Se han eliminado ${deletedCount} usuarios con dominio @vehicar.com`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudieron eliminar los usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="glass-strong rounded-[24px] border-0 shadow-xl animate-fade-in hover-lift">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-emerald-800 flex items-center group-hover:text-emerald-900 transition-colors">
              <Users className="h-5 w-5 mr-2 text-emerald-500 group-hover:scale-110 transition-transform" />
              Gestión de Usuarios
            </CardTitle>
            <CardDescription className="text-emerald-600">Administra los usuarios de tu aplicación</CardDescription>
          </div>
          <div className="flex items-center space-x-3 animate-slide-in-right" style={{ animationDelay: "0.4s" }}>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-[16px] px-4 py-2 h-auto transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Añadir Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] rounded-[20px] border-emerald-200">
                <DialogHeader>
                  <DialogTitle className="text-emerald-800 flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-emerald-500" />
                    Añadir Nuevo Usuario
                  </DialogTitle>
                  <DialogDescription className="text-emerald-600">
                    Completa el formulario para añadir un nuevo usuario al sistema.
                  </DialogDescription>
                </DialogHeader>
                <UserForm onSubmit={addUser} />
              </DialogContent>
            </Dialog>

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
        <div className="flex flex-col sm:flex-row gap-4 mt-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre, email o departamento..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="rounded-[16px] border-emerald-200 glass hover:border-emerald-300 focus:border-emerald-400 transition-colors"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="rounded-[16px] border-emerald-200 glass w-full sm:w-auto min-w-[150px] hover:border-emerald-300 transition-colors">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="user">Usuario</SelectItem>
              <SelectItem value="guest">Invitado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="rounded-[16px] border-emerald-200 glass w-full sm:w-auto min-w-[150px] hover:border-emerald-300 transition-colors">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={clearFilters}
            variant="outline"
            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 rounded-[12px] px-3 py-1 text-sm transition-all duration-200"
          >
            <Filter className="h-4 w-4 mr-1" />
            Limpiar Filtros
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <UsersTable
          users={filteredUsers}
          onUpdateUser={updateUser}
          onDeleteUser={deleteUser}
          sortConfig={sortConfig}
          onSort={requestSort}
        />
      </CardContent>
    </Card>
  )
}
