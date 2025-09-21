using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoSpringAPI.Models
{
    [Table("usuarios")]
    public class User
    {
        [Key]
        [Column("codigo_usuario")]
        [StringLength(50)]
        public string CodigoUsuario { get; set; } = string.Empty;

        [Required]
        [Column("contrasena")]
        [StringLength(255)]
        public string Contrasena { get; set; } = string.Empty;

        [Required]
        [Column("nombre")]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [Column("apellido")]
        [StringLength(100)]
        public string Apellido { get; set; } = string.Empty;

        [Required]
        [Column("rol")]
        [StringLength(50)]
        public string Rol { get; set; } = "usuario";

        [Column("foto")]
        public byte[]? Foto { get; set; }

        [Column("activo")]
        public bool Activo { get; set; } = true;

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; }

        [Column("ultimo_acceso")]
        public DateTime? UltimoAcceso { get; set; }
    }
}