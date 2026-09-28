import axios from "axios";

// Con esto en vez de escribir la URL completa cada vez, solo hará
// falta escribir la parte que cambia, como por ejemplo:
// api.post("/auth/login", ...)
const api = axios.create({
    baseURL: "http://127.0.0.1:8000"
});




// Interceptor se ejecuta automáticamente antes de enviar cualquier petición.
// comprueba si existe un token de usuario guardado en localStorage
// si existe lo añade al authorization headers para el backend
// peuda identificar al usuario y comprobar que está autenticado
// cualquier llamada que haga (api.post(...), api.get(...), etc) llevará el token automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")

    if(token) {
        //config es un objeto que Axios crea y proporciona con la configuración
        // de la petición que está a punto de enviar
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
});

// Este interceptor se ejecuta después de recibir cualquier respuesta
// si en algún momento el backend responde 401 (token inválido o caducado)
// limpio el token guardado y fuerzo una redirección al login, sin Tener
// que gestionar esto manualmente en cada pantalla por separado
api.interceptors.response.use(
    (respuesta) => respuesta, // si todo va bien no hago nada especial
    (error) => {
        if(error.response?.status === 401) {
            localStorage.removeItem("token")
            window.location.href = "/"
        }
        // lanzo el error
        return Promise.reject(error)
    }
);


export default api;