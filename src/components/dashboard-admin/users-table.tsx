"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  ShieldX,
  Trash2,
  UserCog,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { UserForm } from "./user-form"
import type { User } from "@/types/dashboard-types"

interface UsersTableProps {
  users: User[]
  onUpdateUser: (user: User) => void
  onDeleteUser: (userId: string) => void
  sortConfig: { key: keyof User; direction: "ascending" | "descending" } | null
  onSort: (key: keyof User) => void
}

export function UsersTable({ users, onUpdateUser, onDeleteUser, sortConfig, onSort }: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const getSortIcon = (key: keyof User) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === "ascending" ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )
    }
    return null
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-emerald-500 animate-fade-in">
        <Users className="h-12 w-12 mx-auto mb-4 text-emerald-300 animate-float" />
        <p className="text-lg font-medium text-emerald-600">No se encontraron usuarios</p>
        <p className="text-sm text-emerald-500">Intenta ajustar los filtros de búsqueda</p>
      </div>
    )
  }

  return (
    <div className="rounded-[16px] overflow-hidden glass animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <Table>
        <TableHeader>
          <TableRow className="border-emerald-200 hover:bg-emerald-50/30">
            <TableHead
              className="font-semibold text-emerald-700 cursor-pointer hover:text-emerald-900 transition-colors"
              onClick={() => onSort("name")}
            >
              <div className="flex items-center">
                Usuario
                {getSortIcon("name")}
              </div>
            </TableHead>
            <TableHead
              className="font-semibold text-emerald-700 cursor-pointer hover:text-emerald-900 transition-colors"
              onClick={() => onSort("email")}
            >
              <div className="flex items-center">
                Email
                {getSortIcon("email")}
              </div>
            </TableHead>
            <TableHead className="font-semibold text-emerald-700">Rol</TableHead>
            <TableHead className="font-semibold text-emerald-700">Estado</TableHead>
            <TableHead
              className="font-semibold text-emerald-700 cursor-pointer hover:text-emerald-900 transition-colors"
              onClick={() => onSort("lastLogin")}
            >
              <div className="flex items-center">
                Último Acceso
                {getSortIcon("lastLogin")}
              </div>
            </TableHead>
            <TableHead className="font-semibold text-emerald-700">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow
              key={user.id}
              className="border-emerald-100 hover:bg-emerald-50/50 transition-all duration-200 animate-fade-in group"
              style={{ animationDelay: `${0.5 + index * 0.05}s` }}
            >
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-9 w-9 border border-emerald-200">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-emerald-800 group-hover:text-emerald-900 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-xs text-emerald-600">{user.department}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-emerald-700 group-hover:text-emerald-800 transition-colors">
                <div className="flex items-center space-x-1">
                  <Mail className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-1 text-xs text-emerald-600 mt-1">
                    <Phone className="h-3 w-3" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  className={`
                    ${
                      user.role === "admin"
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : user.role === "user"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }
                    transition-colors
                  `}
                >
                  <div className="flex items-center space-x-1">
                    {user.role === "admin" ? (
                      <ShieldCheck className="h-3 w-3 mr-1" />
                    ) : user.role === "user" ? (
                      <Shield className="h-3 w-3 mr-1" />
                    ) : (
                      <ShieldX className="h-3 w-3 mr-1" />
                    )}
                    <span>
                      {user.role === "admin" ? "Administrador" : user.role === "user" ? "Usuario" : "Invitado"}
                    </span>
                  </div>
                </Badge>
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1 ${
                    user.status === "active"
                      ? "bg-green-100 text-green-700"
                      : user.status === "inactive"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {user.status === "active" ? (
                    <>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1"></div>
                      <span>Activo</span>
                    </>
                  ) : user.status === "inactive" ? (
                    <>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-1"></div>
                      <span>Inactivo</span>
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></div>
                      <span>Pendiente</span>
                    </>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-emerald-600 text-sm">{user.lastLogin ? user.lastLogin : "Nunca"}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-full transition-all duration-200 hover:scale-110"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] rounded-[20px] border-emerald-200">
                      <DialogHeader>
                        <DialogTitle className="text-emerald-800 flex items-center">
                          <UserCog className="h-5 w-5 mr-2 text-emerald-500" />
                          Editar Usuario
                        </DialogTitle>
                        <DialogDescription className="text-emerald-600">
                          Modifica los datos del usuario {editingUser?.name}.
                        </DialogDescription>
                      </DialogHeader>
                      {editingUser && <UserForm user={editingUser} onSubmit={onUpdateUser} isEditing />}
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-full transition-all duration-200 hover:scale-110"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[20px] border-red-200">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">Confirmar eliminación</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas eliminar al usuario {user.name}? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-[12px] border-gray-200">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 rounded-[12px]"
                          onClick={() => onDeleteUser(user.id)}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
