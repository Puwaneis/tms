import { useLocation } from "react-router-dom"
import { Button } from "#components/ui/button"
import { IconLogout } from "@tabler/icons-react"
import { useAuth } from "../../context/AuthContext"
import { SidebarTrigger } from "#components/ui/sidebar"
import { Separator } from "#components/ui/separator"

const Header = ({ showSidebarTrigger = true }) => {
  const { logout } = useAuth();
  const currentPath = useLocation().pathname;
  const pageTitle =
    currentPath === '/'
      ? 'Home'
      : currentPath.split('/').pop().charAt(0).toUpperCase() + currentPath.split('/').pop().slice(1);

  return (
    <header className={`flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) p-2 bg-black ${showSidebarTrigger ? 'rounded-tr-2xl rounded-tl-2xl' : ''}`}>
      <div className="flex w-full items-center gap-1 lg:gap-2">
        {showSidebarTrigger && (
          <>
            <SidebarTrigger className="size-10 text-black cursor-pointer hover:bg-gray-200 bg-white rounded-xl" />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-10 bg-white" />
          </>
        )}
        <span className="font-bold text-white">{pageTitle}</span>
        <div className="ml-auto flex items-center gap-2">
          <Button size="lg" className="bg-red-500 hover:bg-red-600 rounded-xl cursor-pointer" onClick={logout}>
            <IconLogout className="size-5!" />
            <span className="text-base font-semibold">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
