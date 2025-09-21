using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlexoSpringAPI.Data;
using FlexoSpringAPI.Models;

namespace FlexoSpringAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly FlexoDbContext _context;

        public UserController(FlexoDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public async Task<ActionResult<User>> CreateUser([FromBody] CreateUserRequest request)
        {
            try
            {
                // Verificar si el usuario ya existe
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.CodigoUsuario == request.CodigoUsuario);

                if (existingUser != null)
                {
                    return BadRequest(new { message = "El código de usuario ya existe" });
                }

                // Convertir foto base64 a bytes si se proporciona
                byte[]? fotoBytes = null;
                if (!string.IsNullOrEmpty(request.FotoBase64))
                {
                    try
                    {
                        fotoBytes = Convert.FromBase64String(request.FotoBase64);
                    }
                    catch
                    {
                        return BadRequest(new { message = "Formato de imagen inválido" });
                    }
                }

                // Crear nuevo usuario
                var user = new User
                {
                    CodigoUsuario = request.CodigoUsuario,
                    Contrasena = BCrypt.Net.BCrypt.HashPassword(request.Contrasena),
                    Nombre = request.Nombre,
                    Apellido = request.Apellido,
                    Rol = request.Rol,
                    Foto = fotoBytes,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Preparar respuesta sin datos sensibles
                var userResponse = new
                {
                    CodigoUsuario = user.CodigoUsuario,
                    Nombre = user.Nombre,
                    Apellido = user.Apellido,
                    Rol = user.Rol,
                    Activo = user.Activo,
                    FechaCreacion = user.FechaCreacion,
                    TieneFoto = user.Foto != null
                };

                return Ok(new { message = "Usuario creado exitosamente", user = userResponse });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error interno: {ex.Message}" });
            }
        }

        [HttpGet("count")]
        public async Task<ActionResult<int>> GetUserCount()
        {
            try
            {
                var count = await _context.Users.CountAsync();
                return Ok(new { count, message = $"Total de usuarios: {count}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al contar usuarios: {ex.Message}" });
            }
        }

        [HttpGet("test-connection")]
        public async Task<ActionResult> TestConnection()
        {
            try
            {
                // Intentar conectar a la base de datos
                await _context.Database.CanConnectAsync();
                
                // Verificar si la tabla existe
                var tableExists = await _context.Database
                    .SqlQueryRaw<int>("SELECT COUNT(*) as Value FROM information_schema.tables WHERE table_schema = 'flexoBD2' AND table_name = 'usuarios'")
                    .FirstOrDefaultAsync();

                return Ok(new 
                { 
                    message = "Conexión exitosa", 
                    database = "flexoBD2",
                    tableExists = tableExists > 0,
                    timestamp = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new 
                { 
                    message = "Error de conexión", 
                    error = ex.Message,
                    timestamp = DateTime.Now
                });
            }
        }

        [HttpGet("{codigoUsuario}/foto")]
        public async Task<ActionResult> GetUserPhoto(string codigoUsuario)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.CodigoUsuario == codigoUsuario);

                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                if (user.Foto == null)
                {
                    return NotFound(new { message = "Usuario no tiene foto" });
                }

                return File(user.Foto, "image/jpeg");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al obtener foto: {ex.Message}" });
            }
        }

        [HttpPost("{codigoUsuario}/foto")]
        public async Task<ActionResult> UpdateUserPhoto(string codigoUsuario, [FromBody] UpdatePhotoRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.CodigoUsuario == codigoUsuario);

                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                if (string.IsNullOrEmpty(request.FotoBase64))
                {
                    return BadRequest(new { message = "Foto requerida" });
                }

                try
                {
                    user.Foto = Convert.FromBase64String(request.FotoBase64);
                    await _context.SaveChangesAsync();

                    return Ok(new { message = "Foto actualizada exitosamente" });
                }
                catch
                {
                    return BadRequest(new { message = "Formato de imagen inválido" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error al actualizar foto: {ex.Message}" });
            }
        }
    }

    public class CreateUserRequest
    {
        public string CodigoUsuario { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Rol { get; set; } = "usuario";
        public string? FotoBase64 { get; set; }
    }

    public class UpdatePhotoRequest
    {
        public string FotoBase64 { get; set; } = string.Empty;
    }
}