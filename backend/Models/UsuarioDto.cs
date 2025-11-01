using System.ComponentModel.DataAnnotations;

namespace FlexoAuthBackend.Models
{
    public class UsuarioDto
    {
        public string CodigoUsuario { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Apellidos { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string? Correo { get; set; }
        public string Rol { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public string Permisos { get; set; } = string.Empty;
        public string? ImagenPerfil { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaUpdate { get; set; }
    }

    public class CrearUsuarioRequest
    {
        [Required]
        [StringLength(20)]
        public string CodigoUsuario { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string Nombre { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string Apellidos { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string? Correo { get; set; }
        
        [Required]
        [StringLength(20)]
        public string Rol { get; set; } = string.Empty;
        
        [StringLength(15)]
        public string? Telefono { get; set; }
        
        [Required]
        [StringLength(255)]
        public string Contrasena { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string Permisos { get; set; } = string.Empty;
        
        [StringLength(255)]
        public string? ImagenPerfil { get; set; }
    }

    public class ActualizarUsuarioRequest
    {
        [Required]
        [StringLength(20)]
        public string Nombre { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string Apellidos { get; set; } = string.Empty;
        
        [StringLength(50)]
        public string? Correo { get; set; }
        
        [Required]
        [StringLength(20)]
        public string Rol { get; set; } = string.Empty;
        
        [StringLength(15)]
        public string? Telefono { get; set; }
        
        [StringLength(50)]
        public string? Permisos { get; set; }
        
        [StringLength(255)]
        public string? ImagenPerfil { get; set; }
        
        public bool? Activo { get; set; }
    }

    public class CambiarContrasenaRequest
    {
        [Required]
        public string ContrasenaActual { get; set; } = string.Empty;
        
        [Required]
        [StringLength(255)]
        public string NuevaContrasena { get; set; } = string.Empty;
    }
}