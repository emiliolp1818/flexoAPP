using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoApp.Models
{
    [Table("WorkOrders")]
    public class WorkOrder
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Articulo { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string OtSap { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Cliente { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Referencia { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string Td { get; set; } = string.Empty;

        public int Colores { get; set; }

        public int KilosSustrato { get; set; }

        public int Kilos { get; set; }

        [Required]
        [MaxLength(20)]
        public string Estado { get; set; } = "listo";

        [MaxLength(500)]
        public string? MotivoSuspension { get; set; }

        public int Maquina { get; set; }

        [Required]
        [MaxLength(100)]
        public string Sustrato { get; set; } = string.Empty;

        // Almacenar como JSON string en la base de datos
        [Column(TypeName = "nvarchar(max)")]
        public string ColoresDetalle { get; set; } = string.Empty;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string UsuarioActualizacion { get; set; } = string.Empty;

        // Navegación a la máquina
        [ForeignKey("Maquina")]
        public virtual Machine? MachineNavigation { get; set; }
    }
}