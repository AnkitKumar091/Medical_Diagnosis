"use client"

import { Brain, Home, Upload, FileImage, Info, Phone, LogOut, User, Database, Download } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { authService } from "@/lib/auth"
import { useState } from "react"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Upload Image",
    url: "/dashboard/upload",
    icon: Upload,
  },
  {
    title: "My Scans",
    url: "/dashboard/scans",
    icon: FileImage,
  },
]

const generalItems = [
  {
    title: "About",
    url: "/about",
    icon: Info,
  },
  {
    title: "Contact",
    url: "/contact",
    icon: Phone,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleSignOut = () => {
    authService.signOut()
    toast({
      title: "Signed out",
      description: "You have been successfully signed out. Your data is safely stored.",
    })
    router.push("/")
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const userData = await authService.exportUserData()
      if (userData) {
        const dataStr = JSON.stringify(userData, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `mediscan_data_${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({
          title: "Data exported",
          description: "Your medical data has been exported successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-2">
          <div className="p-1 bg-blue-100 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <span className="text-lg font-bold">MediScan AI</span>
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <Database className="h-3 w-3" />
              <span>Data Stored</span>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Patient Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Information</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {generalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Data Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2"
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export Data"}
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User />
              <span>Patient Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button variant="ghost" className="w-full justify-start px-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
