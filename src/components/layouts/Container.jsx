import { Outlet } from 'react-router-dom'

const Container = ({ showSidebarTrigger = true }) => {
  return (
    <div className={`@container/main flex flex-1 flex-col gap-2 bg-gray-200 rounded-br-2xl rounded-bl-2xl ${showSidebarTrigger ? 'rounded-br-2xl rounded-bl-2xl' : ''}`}>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Container