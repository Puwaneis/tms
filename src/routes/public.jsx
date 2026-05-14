import Login from '../pages/Login'
import Register from '../pages/Register'

const publicRoutes = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  }
]

export default publicRoutes;