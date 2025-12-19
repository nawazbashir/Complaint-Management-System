"use client"

import { usePathname, useRouter } from "next/navigation"
import { User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import React from "react"
import { logout } from "@/lib/features/auth-slice"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { issueApi } from "@/lib/features/issue-api"
import { complaintApi } from "@/lib/features/complaint-api"
import { departmentApi } from "@/lib/features/department-api"
import { authApi } from "@/lib/features/auth-api"
import { roleApi } from "@/lib/features/role-api"
import { userApi } from "@/lib/features/user-api"

const labelMap: Record<string, string> = {
  "issue-def": "Issue Def",
  "department-def": "Department Def",
  "company-def": "Company Def",
  "role-def": "Role Def",
  "user-def": "User Def",
  "complaints": "Complaints",
}

export function HeaderNav() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)

  const handleLogout = () => {
    dispatch(issueApi.util.resetApiState())
    dispatch(complaintApi.util.resetApiState())
    dispatch(departmentApi.util.resetApiState())
    dispatch(authApi.util.resetApiState())
    dispatch(roleApi.util.resetApiState())
    dispatch(userApi.util.resetApiState())

    dispatch(logout())
    router.push("/login")
  }

  const getUserInitials = () => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Generate breadcrumb items from pathname
  const getBreadcrumbs = () => {
    if (pathname === "/") {
      return [{ label: "Home", href: "/", isCurrentPage: true }]
    }

    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs = [{ label: "Home", href: "/", isCurrentPage: false }]

    let currentPath = ""
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const label =
        labelMap[segment] ||
        segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrentPage: index === segments.length - 1,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {crumb.isCurrentPage ? (
                  <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href} className="text-muted-foreground hover:text-foreground">
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm font-medium hidden sm:block">{user?.name || "User"}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Avatar className="size-8 cursor-pointer">
                <AvatarImage src="/diverse-user-avatars.png" alt="User" />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>
              <User className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
