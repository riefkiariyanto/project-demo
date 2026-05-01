import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    server: {
        host: "0.0.0.0",
        port: 5173,
        strictPort: true,
<<<<<<< HEAD

        hmr: {
            host: "localhost",
        },
        watch: {
            usePolling: true,
        },
    },
=======
        watch: {
            usePolling: true,
        },
        hmr: {
            host: 'localhost',
        },
        cors: true,
    },

>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
    plugins: [
        laravel({
            input: "resources/js/app.jsx",
            refresh: true,
        }),
        react(),
    ],
<<<<<<< HEAD
});
=======
});
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
