import { useLocation, useNavigate } from 'react-router-dom';

export const useSmartNavigate = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const smartNavigate = (to, options) => {
        if (to === -1) {
            navigate(-1, options);
            return;
        }

        if (location.pathname !== to) {
            navigate(to, options);
        }
    };

    return smartNavigate;
};
