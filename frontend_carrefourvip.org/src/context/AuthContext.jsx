import { createContext } from "react";

const authData = {
    is_login: false,
    user: null
};

const AuthContext = createContext({
    authData,
    setAuthData: () => {}
});

export default AuthContext;
