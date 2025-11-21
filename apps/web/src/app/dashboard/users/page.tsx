"use client"

import { useState, useEffect } from "react"
import { Search, Filter, MoreHorizontal, Edit, Trash, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { UserFormDialog } from "@/components/forms/user-form-dialog"
import { fetchUsers, deleteUser, User } from "@/lib/api-client"

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        setLoading(true)
        try {
            const data = await fetchUsers()
            setUsers(data)
        } catch (error) {
            console.error("Failed to load users:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return

        try {
            await deleteUser(id)
            await loadUsers()
        } catch (error) {
            console.error("Failed to delete user:", error)
            alert("Kullanıcı silinemedi. Lütfen tekrar deneyin.")
        }
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "default"
            case "MANAGER":
                return "secondary"
            case "WORKER":
                return "outline"
            default:
                return "outline"
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Kullanıcılar</h1>
                <UserFormDialog onSuccess={loadUsers} />
            </div>
            <Card>
                <CardHeader className="px-7">
                    <CardTitle>Kullanıcı Yönetimi</CardTitle>
                    <CardDescription>
                        Kullanıcı hesaplarını ve izinlerini yönetin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Kullanıcı ara..."
                                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                            <span className="sr-only">Filter</span>
                        </Button>
                    </div>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Kullanıcılar yükleniyor...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Kullanıcı bulunamadı. Oluşturmak için &quot;Kullanıcı Ekle&quot;ye tıklayın.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kullanıcı ID</TableHead>
                                    <TableHead>İsim</TableHead>
                                    <TableHead className="hidden md:table-cell">E-posta</TableHead>
                                    <TableHead className="hidden sm:table-cell">Rol</TableHead>
                                    <TableHead className="hidden lg:table-cell">Oluşturulma</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.id.substring(0, 8)}</TableCell>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge variant={getRoleBadgeVariant(user.role)}>
                                                <Shield className="mr-1 h-3 w-3" />
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" /> Düzenle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" /> Sil
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
