"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  Bus,
  LayoutDashboard,
  Users,
  Ticket,
  Wand2,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Banknote,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/passes", label: "Bus Passes", icon: Ticket },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/expenses", label: "Expenses", icon: Banknote },
  { href: "/communication", label: "Communication", icon: MessageSquare },
  { href: "/optimize", label: "AI Optimization", icon: Wand2 },
]

export default function AppSidebar() {
  const pathname = usePathname()

  // A simple function to check for the root path
  const isActive = (href: string) => {
    return href === "/" ? pathname === href : pathname.startsWith(href)
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Bus className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold font-headline">FleetDeck</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(link.href)}
                tooltip={link.label}
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="#">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center gap-3 p-2 rounded-md bg-sidebar-accent/50 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://placehold.co/100x100.png" alt="Admin" data-ai-hint="person avatar" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-semibold text-sm text-sidebar-foreground">Admin User</span>
              <span className="text-xs text-sidebar-foreground/70">admin@fleetdeck.com</span>
            </div>
            <LogOut className="ml-auto h-5 w-5 cursor-pointer text-sidebar-foreground/70 hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
