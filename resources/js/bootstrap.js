import axios from 'axios';
window.axios = axios;

<<<<<<< HEAD
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
=======
window.axios.defaults.withCredentials = true;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
>>>>>>> 49979cee001e869504cc1e09c0091dd308ddb19d
