import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
<<<<<<< HEAD

=======
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
        root.render(<App {...props} />);
    },
    progress: {
        color: '#97cc12',
    },
<<<<<<< HEAD
});
=======
});
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
