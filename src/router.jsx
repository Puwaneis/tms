import {
  createBrowserRouter,
  createRoutesFromElements,
  Route
} from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import User from './pages/User'
import Task from './pages/Task'
import Login from './pages/Login'
import Register from './pages/Register'

import ProtectedRoutes from './components/routes/ProtectedRoutes'
import PublicRoutes from './components/routes/PublicRoutes'
import AdminRoute from './components/routes/AdminRoute'
import PrivateLayout from './components/layouts/PrivateLayout'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoutes />}>
        <Route element={<PrivateLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route element={<AdminRoute />}>
            <Route path="/users" element={<User />} />
            <Route path="/tasks" element={<Task />} />
          </Route>
        </Route>
      </Route>
    </>
  )
)

export default router
