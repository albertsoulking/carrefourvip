import { useContext, useEffect } from 'react';
import { Cookies } from 'react-cookie';
import AuthContext from '../context/AuthContext';
import web from '../routes/web';
import api from '../routes/api';
import { useSmartNavigate } from './useSmartNavigate';

const useAuth = () => {
    const navigate = useSmartNavigate();
    const { authData, setAuthData } = useContext(AuthContext);

    useEffect(() => {
        authData.is_login && setAuthData(authData);
    }, [authData.is_login]);

    const getAuthCookieExpiration = () => {
        let date = new Date();
        date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

        return date;
    };

    const setAsLogged = (data) => {
        const cookie = new Cookies();
        cookie.set('is_auth', true, {
            expires: getAuthCookieExpiration(),
            sameSite: 'lax',
            httpOnly: false,
            path: '/'
        });

        setAuthData({ ...data });
    };

    const setLogout = () => {
        const cookie = new Cookies();
        cookie.remove('is_auth', {
            expires: getAuthCookieExpiration(),
            sameSite: 'lax',
            httpOnly: false,
            path: '/'
        });

        setAuthData({});
        navigate(web.login);
    };

    const loginUserOnStartup = async () => {
        const cookies = new Cookies();

        if (!Boolean(cookies.get('is_auth'))) {
            setLogout();
            return;
        }

        await api.check().then((response) => {
            const { data } = response.data;

            if (!data.is_login) {
                setLogout();
                return;
            }

            setAuthData({ ...data });
        });
    };

    const setLocalData = (key, value) => {
        const cookies = new Cookies();
        cookies.set(key, value);
    };

    const getLocalData = () => {
        const cookies = new Cookies();
        return cookies.getAll();
    };

    const removeLocalData = () => {
        const cookies = new Cookies();
        Object.keys(cookies.cookies).forEach((name) => {
            cookies.remove(name, {
                expires: getAuthCookieExpiration(),
                sameSite: 'lax',
                httpOnly: false,
                path: '/'
            });
        });
        
        navigate(web.home);
    };

    return {
        userData: authData,
        setAsLogged,
        setLogout,
        loginUserOnStartup,
        setLocalData,
        removeLocalData,
        localData: getLocalData()
    };
};

export default useAuth;
