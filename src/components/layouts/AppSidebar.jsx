import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent, SidebarHeader } from "#components/ui/sidebar"
import { IconHome, IconUser, IconList } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const AppSidebar = ({ variant }) => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const navItems = [
    { title: 'Home', icon: <IconHome className="size-5!" />, url: '/' },
    ...(role === 'super_admin' ? [
      { title: 'Users', icon: <IconUser className="size-5!" />, url: '/users' },
      { title: 'Tasks', icon: <IconList className="size-5!" />, url: '/tasks' },
    ] : []),
  ]

  return (
    <Sidebar collapsible="offcanvas" variant={variant}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarHeader>
              Task Management System
            </SidebarHeader>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} className="cursor-pointer" onClick={() => navigate(item.url)}>
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
