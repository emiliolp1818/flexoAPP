using System.ComponentModel.DataAnnotations;

namespace FlexoSpringAPI.Models
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "El código de usuario es requerido")]
        public string CodigoUsuario { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es requerida")]
        public string Contrasena { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        public UserInfo? User { get; set; }
    }

    public class UserInfo
    {
        public string CodigoUsuario { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
        public string? FotoBase64 { get; set; }
    }
}