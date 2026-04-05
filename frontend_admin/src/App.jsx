import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/login';
import web from './routes/web';
import NotFoundPage from './pages/not_found';
import routes from './routes';

// PrivateRoute component
const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token') !== null;
    return isAuthenticated ? children : <Navigate to={web.login} />;
};

// PublicRoute component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token') !== null;
    return !isAuthenticated ? children : <Navigate to={web.home} />;
};

// Main App component
function App() {
    return (
        <SnackbarProvider
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
            }}
            maxSnack={3}
            autoHideDuration={3000}
            dense>
            <Router>
                <CssBaseline />
                <Routes>
                    {/* 登录页 */}
                    <Route
                        path={web.login}
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />

                    {/* 路由 '/' 直接重定向到 /dashboard */}
                    <Route
                        path={web.home}
                        element={
                            <Navigate
                                to={web.dashboard}
                                replace
                            />
                        }
                    />

                    {/* Dashboard layout 嵌套路由 */}
                    <Route
                        element={
                            <PrivateRoute>
                                <DashboardLayout />
                            </PrivateRoute>
                        }>
                        {routes.map((route) => (
                            <Route
                                key={route.path}
                                {...route}
                            />
                        ))}
                    </Route>

                    {/* Catch all route */}
                    <Route
                        path={web.any}
                        element={<NotFoundPage />}
                    />
                </Routes>
            </Router>
        </SnackbarProvider>
    );
}

export default App;
