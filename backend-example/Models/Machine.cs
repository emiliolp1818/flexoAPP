using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlexoApp.Models
{
    [Table("Machines")]
    public class Machine
    {
        [Key]
        public int Numero { get; set; }

        [Required]
        [MaxLength(50)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Estado { get; set; } = "activa";

        [Column(TypeName = "decimal(5,2)")]
        public decimal Eficiencia { get; set; }

        public int HorasOperacion { get; set; }

        public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;

        // Navegación a las órdenes de trabajo
        public virtual ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
    }
}