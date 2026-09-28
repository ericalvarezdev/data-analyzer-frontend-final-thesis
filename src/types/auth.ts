
// Lo que mando al backend al hacer el login
export interface LoginRequest {
    email: string
    contraseña: string
}

// Lo que el backend me devuelve si el login es correcto
export interface TokenResponse {
    access_token: string
    token_type: string
}

// Lo que envío al backend para crear un usuario
export interface UsuarioCreateRequest {
    nombre: string
    email: string
    contraseña: string
}

// Lo que responde el backend al crear el usuario
export interface UsuarioResponse {
    id: number
    nombre: string
    email: string
    rol: string
    fecha_registro: string
}