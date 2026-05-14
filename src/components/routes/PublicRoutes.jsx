import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoutes = () => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) {
        return <Navigate to="/" />
    }
    return <Outlet />
}

export default PublicRoutes;