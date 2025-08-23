import { SidebarFooter, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { Home, Logs, Smartphone, Laptop, Lock } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import ThemeSwitcher from "@/components/theme-switcher";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider open>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

// Menu items.
const items = [
  {
    title: "Home",
    url: "/avalon",
    icon: Home,
  },
  {
    title: "Logs",
    url: "/avalon/logs",
    icon: Logs,
  },
  {
    title: "Devices",
    url: "/avalon/devices",
    icon: Smartphone,
  },
  {
    title: "Clients",
    url: "/avalon/clients",
    icon: Laptop,
  },
  {
    title: "Vault",
    url: "/avalon/vault",
    icon: Lock,
  },
];

const AppSidebar = () => (
  <Sidebar>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Avalon</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
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
    </SidebarContent>
    <SidebarFooter>
      <ThemeSwitcher />
    </SidebarFooter>
  </Sidebar>
);
