using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlexoApp.Models;
using FlexoApp.Data;

namespace FlexoApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkOrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WorkOrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/workorders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkOrder>>> GetWorkOrders()
        {
            return await _context.WorkOrders
                .OrderBy(w => w.Maquina)
                .ThenBy(w => w.FechaCreacion)
                .ToListAsync();
        }

        // GET: api/workorders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkOrder>> GetWorkOrder(int id)
        {
            var workOrder = await _context.WorkOrders.FindAsync(id);

            if (workOrder == null)
            {
                return NotFound();
            }

            return workOrder;
        }

        // GET: api/workorders/machine/11
        [HttpGet("machine/{machineNumber}")]
        public async Task<ActionResult<IEnumerable<WorkOrder>>> GetWorkOrdersByMachine(int machineNumber)
        {
            return await _context.WorkOrders
                .Where(w => w.Maquina == machineNumber)
                .OrderBy(w => w.FechaCreacion)
                .ToListAsync();
        }

        // PUT: api/workorders/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutWorkOrder(int id, WorkOrderUpdateDto updateDto)
        {
            var workOrder = await _context.WorkOrders.FindAsync(id);
            
            if (workOrder == null)
            {
                return NotFound();
            }

            // Actualizar campos
            if (!string.IsNullOrEmpty(updateDto.Estado))
            {
                workOrder.Estado = updateDto.Estado;
            }
            
            if (!string.IsNullOrEmpty(updateDto.MotivoSuspension))
            {
                workOrder.MotivoSuspension = updateDto.MotivoSuspension;
            }
            
            workOrder.FechaActualizacion = DateTime.UtcNow;
            workOrder.UsuarioActualizacion = updateDto.UsuarioActualizacion ?? "system";

            try
            {
                await _context.SaveChangesAsync();
                
                // Notificar a otros clientes sobre el cambio (SignalR)
                // await _hubContext.Clients.All.SendAsync("WorkOrderUpdated", workOrder);
                
                return Ok(workOrder);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkOrderExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
        }

        // POST: api/workorders
        [HttpPost]
        public async Task<ActionResult<WorkOrder>> PostWorkOrder(WorkOrderCreateDto createDto)
        {
            var workOrder = new WorkOrder
            {
                Articulo = createDto.Articulo,
                OtSap = createDto.OtSap,
                Cliente = createDto.Cliente,
                Referencia = createDto.Referencia,
                Td = createDto.Td,
                Colores = createDto.Colores,
                KilosSustrato = createDto.KilosSustrato,
                Kilos = createDto.Kilos,
                Estado = "listo",
                Maquina = createDto.Maquina,
                Sustrato = createDto.Sustrato,
                ColoresDetalle = createDto.ColoresDetalle,
                FechaCreacion = DateTime.UtcNow,
                FechaActualizacion = DateTime.UtcNow,
                UsuarioActualizacion = createDto.UsuarioActualizacion ?? "system"
            };

            _context.WorkOrders.Add(workOrder);
            await _context.SaveChangesAsync();

            // Notificar a otros clientes sobre el nuevo registro
            // await _hubContext.Clients.All.SendAsync("WorkOrderCreated", workOrder);

            return CreatedAtAction("GetWorkOrder", new { id = workOrder.Id }, workOrder);
        }

        // DELETE: api/workorders/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkOrder(int id)
        {
            var workOrder = await _context.WorkOrders.FindAsync(id);
            if (workOrder == null)
            {
                return NotFound();
            }

            _context.WorkOrders.Remove(workOrder);
            await _context.SaveChangesAsync();

            // Notificar a otros clientes sobre la eliminación
            // await _hubContext.Clients.All.SendAsync("WorkOrderDeleted", id);

            return NoContent();
        }

        private bool WorkOrderExists(int id)
        {
            return _context.WorkOrders.Any(e => e.Id == id);
        }
    }

    // DTOs para las operaciones
    public class WorkOrderUpdateDto
    {
        public string? Estado { get; set; }
        public string? MotivoSuspension { get; set; }
        public string? UsuarioActualizacion { get; set; }
    }

    public class WorkOrderCreateDto
    {
        public string Articulo { get; set; } = string.Empty;
        public string OtSap { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public string Referencia { get; set; } = string.Empty;
        public string Td { get; set; } = string.Empty;
        public int Colores { get; set; }
        public int KilosSustrato { get; set; }
        public int Kilos { get; set; }
        public int Maquina { get; set; }
        public string Sustrato { get; set; } = string.Empty;
        public string ColoresDetalle { get; set; } = string.Empty; // JSON string
        public string? UsuarioActualizacion { get; set; }
    }
}