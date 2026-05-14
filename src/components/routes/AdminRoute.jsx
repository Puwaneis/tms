import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
    const { role } = useAuth();
    if (role !== 'super_admin') {
        return <Navigate to="/" replace />
    }
    return <Outlet />
}

export default AdminRoute;
