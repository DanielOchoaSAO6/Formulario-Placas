"use client"

import type React from "react"
import { useState } from "react"
import { UserPlus, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import type { User } from "@/types/dashboard-types"

interface UserFormProps {
  user?: User
  onSubmit: (data: any) => void
  isEditing?: boolean
}

export function UserForm({ user, onSubmit, isEditing = false }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "user",
    status: user?.status || "active",
    phone: user?.phone || "",
    department: user?.department || "",
    permissions: user?.permissions || [],
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    changePassword: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handlePermissionToggle = (permission: string) => {
    const permissions = formData.permissions.includes(permission)
      ? formData.permissions.filter((p) => p !== permission)
      : [...formData.permissions, permission]
    setFormData({ ...formData, permissions })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que las contraseñas coincidan si se está cambiando la contraseña
    if (formData.changePassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert('Las contraseñas nuevas no coinciden')
        return
      }
      
      if (!formData.currentPassword) {
        alert('Debe ingresar la contraseña actual')
        return
      }
      
      if (!formData.newPassword) {
        alert('Debe ingresar una nueva contraseña')
        return
      }
    }
    
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="rounded-[12px] border-emerald-200 hover:border-emerald-300 focus:border-emerald-400 transition-colors"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="rounded-[12px] border-emerald-200 hover:border-emerald-300 focus:border-emerald-400 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="rounded-[12px] border-emerald-200 hover:border-emerald-300 focus:border-emerald-400 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1">
        <div className="space-y-2">
          <Label>Rol</Label>
          <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
            <SelectTrigger className="rounded-[12px] border-emerald-200 hover:border-emerald-300 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="user">Usuario</SelectItem>
              <SelectItem value="guest">Invitado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Sección de cambio de contraseña (solo visible en modo edición) */}
      {isEditing && (
        <div className="space-y-4 mt-6 p-4 rounded-[12px] border border-emerald-200 bg-white/50">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-medium text-emerald-700">Cambiar contraseña</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="change-password"
                checked={formData.changePassword}
                onCheckedChange={(checked) => setFormData({ ...formData, changePassword: checked })}
              />
              <Label htmlFor="change-password">Activar cambio de contraseña</Label>
            </div>
          </div>
          
          {formData.changePassword && (
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="rounded-[12px] border-emerald-200 hover:border-emerald-300 focus:border-emerald-400 transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="rounded-[12px] border-emerald-200 hover:border-emerald-300 focus:border-emerald-400 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="rounded-[12px] border-emerald-200 hover:border-emerald-300 focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-[12px] transition-all duration-300"
          >
            Cancelar
          </Button>
        </DialogClose>
        <Button
          type="submit"
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-[12px] transition-all duration-300 hover:shadow-lg"
        >
          {isEditing ? (
            <>
              <UserCog className="h-4 w-4 mr-2" />
              Actualizar usuario
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Añadir usuario
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
