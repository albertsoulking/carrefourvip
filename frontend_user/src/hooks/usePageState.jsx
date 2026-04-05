import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const usePageState = (defaultState) => {
    const location = useLocation();
    const key = `page_state_${location.pathname}`;

    const [state, setState] = useState(() => {
        const stored = sessionStorage.getItem(key);
        if (stored) {
            try {
                return { ...defaultState, ...JSON.parse(stored) };
            } catch (e) {
                console.warn('parse failed');
            }
        }
        return defaultState;
    });

    useEffect(() => {
        sessionStorage.setItem(key, JSON.stringify(state));
    }, [state]);

    return [state, setState];
};

export default usePageState;
