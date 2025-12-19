"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  LayoutDashboard,
  AlertCircle,
  Building2,
  Building,
  Users,
  GalleryVerticalEnd,
  Home,
  AlertOctagon,
  ShieldCheck,
} from "lucide-react";

import { SearchForm } from "@/components/search-form";
// import { VersionSwitcher } from "@/components/version-switcher"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Navigation data
const data = {
  standaloneItems: [
    { title: "Home", url: "/", icon: Home },
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Complaints", url: "/complaints", icon: AlertOctagon },
  ],
  navMain: [
    {
      title: "Application Setup",
      url: "#",
      items: [
        { title: "Issue Def", url: "/issue-def", icon: AlertCircle },
        { title: "Department Def", url: "/department-def", icon: Building2 },
        { title: "Company Def", url: "/company-def", icon: Building },
        { title: "Role Def", url: "/role-def", icon: ShieldCheck },
        { title: "User Def", url: "/user-def", icon: Users },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter navigation items based on search query
  const filteredNavMain = React.useMemo(() => {
    if (!searchQuery.trim()) return data.navMain;

    return data.navMain
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [searchQuery]);

  // Filter standalone items based on search query
  const filteredStandaloneItems = React.useMemo(() => {
    if (!searchQuery.trim()) return data.standaloneItems;

    return data.standaloneItems.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* <VersionSwitcher versions={data.versions} defaultVersion={data.versions[0]} /> */}
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">Brick Laboriteries</span>
            <span className="">CMS</span>
          </div>
        </SidebarMenuButton>
        <SearchForm onSearch={setSearchQuery} />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {filteredStandaloneItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredStandaloneItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredNavMain.map((section) => (
          <Collapsible
            key={section.title}
            title={section.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
              >
                <CollapsibleTrigger>
                  {section.title}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <Link href={item.url}>
                            <item.icon className="size-4" />
                            {item.title}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
