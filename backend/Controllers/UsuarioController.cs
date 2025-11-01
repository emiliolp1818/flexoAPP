using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FlexoAuthBackend.Models;
using FlexoAuthBackend.Services;

namespace FlexoAuthBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsuarioController : ControllerBase
    {
        private readonly UsuarioService _usuarioService;

        public UsuarioController(UsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        /// <summary>
        /// Obtener usuarios con paginación tradicional (OFFSET/FETCH)
        /// Recomendado para volúmenes pequeños a medianos
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<PagedResult<UsuarioDto>>> GetUsuarios([FromQuery] UsuarioPaginationRequest request)
        {
            try
            {
                var result = await _usuarioService.GetUsuariosPaginatedAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener usuarios con paginación basada en cursor
        /// Recomendado para grandes volúmenes de datos (>10,000 registros)
        /// Más eficiente para navegación secuencial
        /// </summary>
        [HttpGet("cursor")]
        public async Task<ActionResult<CursorPagedResult<UsuarioDto>>> GetUsuariosCursor([FromQuery] CursorPaginationRequest request)
        {
            try
            {
                var result = await _usuarioService.GetUsuariosCursorPaginatedAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Búsqueda avanzada de usuarios con múltiples filtros
        /// Permite filtrar por cualquier campo del usuario
        /// </summary>
        [HttpPost("search")]
        public async Task<ActionResult<PagedResult<UsuarioDto>>> SearchUsuarios([FromBody] UsuarioSearchRequest request)
        {
            try
            {
                var result = await _usuarioService.SearchUsuariosAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener usuario específico por código
        /// </summary>
        [HttpGet("{codigoUsuario}")]
        public async Task<ActionResult<UsuarioDto>> GetUsuario(string codigoUsuario)
        {
            try
            {
                var usuario = await _usuarioService.GetUsuarioByCodigoAsync(codigoUsuario);
                
                if (usuario == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                return Ok(usuario);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Crear nuevo usuario
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<UsuarioDto>> CreateUsuario([FromBody] CrearUsuarioRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var usuario = await _usuarioService.CreateUsuarioAsync(request);
                return CreatedAtAction(nameof(GetUsuario), new { codigoUsuario = usuario.CodigoUsuario }, usuario);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener estadísticas de usuarios (optimizado)
        /// Útil para dashboards y reportes
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetUsuarioStats()
        {
            try
            {
                var stats = await _usuarioService.GetUsuarioStatsOptimizedAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener información básica de usuarios (más rápido)
        /// Solo campos esenciales para listas simples
        /// </summary>
        [HttpGet("basic")]
        public async Task<ActionResult<PagedResult<object>>> GetUsuariosBasic([FromQuery] UsuarioPaginationRequest request)
        {
            try
            {
                var result = await _usuarioService.GetUsuariosBasicInfoAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Verificar si existe un usuario (muy rápido)
        /// </summary>
        [HttpHead("{codigoUsuario}")]
        [HttpGet("{codigoUsuario}/exists")]
        public async Task<ActionResult> ExistsUsuario(string codigoUsuario)
        {
            try
            {
                var exists = await _usuarioService.ExistsUsuarioAsync(codigoUsuario);
                
                if (exists)
                {
                    return Ok(new { exists = true });
                }
                else
                {
                    return NotFound(new { exists = false });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Contar usuarios con filtros (optimizado)
        /// </summary>
        [HttpGet("count")]
        public async Task<ActionResult<object>> CountUsuarios([FromQuery] UsuarioPaginationRequest request)
        {
            try
            {
                var count = await _usuarioService.CountUsuariosAsync(request);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener usuarios por rol con paginación
        /// </summary>
        [HttpGet("by-role/{rol}")]
        public async Task<ActionResult<PagedResult<UsuarioDto>>> GetUsuariosByRol(
            string rol, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var request = new UsuarioPaginationRequest
                {
                    Page = page,
                    PageSize = pageSize,
                    Rol = rol
                };

                var result = await _usuarioService.GetUsuariosPaginatedAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}