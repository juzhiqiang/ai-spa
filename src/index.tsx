import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './wdyr.tsx';
import App from './pages/App';

// useEffect
// useCallback
// useMemo
// useTransition
// use
//状态撕裂

const container = document.getElementById('app');
if (!container) {
    throw new Error('Failed to find the root element');
}
const root = createRoot(container);

root.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
);
