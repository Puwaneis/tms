import Container from './Container'
import AppSidebar from './AppSidebar'
import { SidebarProvider, SidebarInset } from '#components/ui/sidebar'
import Header from './Header'
import { useAuth } from '../../context/AuthContext'

const PrivateLayout = () => {
  const { role } = useAuth()
  const showSidebar = role === 'super_admin'

  if (!showSidebar) {
    return (
      <div className="flex min-h-svh w-full flex-col bg-background">
        <Header showSidebarTrigger={false} />
        <Container showSidebarTrigger={false} />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Header showSidebarTrigger={true} />
        <Container showSidebarTrigger={true} />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default PrivateLayout
