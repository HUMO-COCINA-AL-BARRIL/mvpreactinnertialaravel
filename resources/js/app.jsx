import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Toaster } from 'react-hot-toast';
import AppNotifications from '@/Components/AppNotifications';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function InertiaShell({ App, props }) {
    return (
        <>
            <App {...props} />
            <AppNotifications />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3500,
                    style: {
                        borderRadius: '16px',
                        background: '#171717',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.08)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#fbbf24',
                            secondary: '#171717',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#fb7185',
                            secondary: '#171717',
                        },
                    },
                }}
            />
        </>
    );
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<InertiaShell App={App} props={props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
