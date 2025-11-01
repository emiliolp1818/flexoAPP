using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoAuthBackend.Models
{
    [Table("usuario")]
    public class Usuario
    {
        [Key]
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
        
        public bool Activo { get; set; } = true;
        
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        
        public DateTime FechaUpdate { get; set; } = DateTime.UtcNow;
        
        // Propiedades calculadas para compatibilidad
        [NotMapped]
        public string NombreCompleto => $"{Nombre} {Apellidos}";
        
        [NotMapped]
        public string Username => CodigoUsuario;
        
        [NotMapped]
        public string Email => Correo ?? string.Empty;
        
        [NotMapped]
        public string Password => Contrasena;
        
        [NotMapped]
        public bool IsActive => Activo;
        
        [NotMapped]
        public DateTime CreatedAt => FechaCreacion;
    }
}