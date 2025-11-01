namespace FlexoAuthBackend.Models
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string CodigoUsuario { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Apellidos { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
        public string Permisos { get; set; } = string.Empty;
        public string? ImagenPerfil { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}