import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './config/i18n.js';
import App from './App.jsx';
import 'react-quill/dist/quill.snow.css';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <App />
        </LocalizationProvider>
    </StrictMode>
);
