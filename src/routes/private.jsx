import Dashboard from '../pages/Dashboard'
import User from '../pages/User'
import Task from '../pages/Task'

const privateRoutes = [
  {
    path: '/',
    element: <Dashboard />
  },
  {
    path: '/users',
    element: <User />
  },
  {
    path: '/tasks',
    element: <Task />
  }
]

export default privateRoutes;