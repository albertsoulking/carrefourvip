import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AuthContext from '../context/AuthContext';
import routes from '../routes';
import { CssBaseline } from '@mui/material';
import Layout from '../pages/layout';

const Router = () => {
    const { userData } = useAuth();
    const [authData, setAuthData] = useState({
        is_login: userData.is_login,
        user: userData.user
    });

    return (
        <AuthContext.Provider value={{ authData, setAuthData }}>
            <CssBaseline />
            <Routes>
                <Route element={<Layout />}>
                    {routes.map((item, index) => (
                        <Route
                            key={index}
                            exact
                            {...item}
                        />
                    ))}
                </Route>
            </Routes>
        </AuthContext.Provider>
    );
};

export default Router;
