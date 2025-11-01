using Microsoft.EntityFrameworkCore;
using FlexoAuthBackend.Data;
using FlexoAuthBackend.Models;
using System.Linq.Expressions;

namespace FlexoAuthBackend.Services
{
    public class UsuarioService
    {
        private readonly FlexoDbContext _context;
        private readonly ILogger<UsuarioService> _logger;

        public UsuarioService(
            FlexoDbContext context, 
            ILogger<UsuarioService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Paginación tradicional con OFFSET/FETCH
        public async Task<PagedResult<UsuarioDto>> GetUsuariosPaginatedAsync(UsuarioPaginationRequest request)
        {
            var query = _context.Usuarios.AsNoTracking().AsQueryable();

            // Aplicar filtros
            query = ApplyFilters(query, request);

            // Contar total antes de paginación
            var totalCount = await query.CountAsync();

            // Aplicar ordenamiento
            query = ApplySorting(query, request.SortBy, request.SortDescending);

            // Aplicar paginación con OFFSET/FETCH
            var items = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(u => new UsuarioDto
                {
                    CodigoUsuario = u.CodigoUsuario,
                    Nombre = u.Nombre,
                    Apellidos = u.Apellidos,
                    NombreCompleto = u.NombreCompleto,
                    Correo = u.Correo,
                    Rol = u.Rol,
                    Telefono = u.Telefono,
                    Permisos = u.Permisos,
                    ImagenPerfil = u.ImagenPerfil,
                    Activo = u.Activo,
                    FechaCreacion = u.FechaCreacion,
                    FechaUpdate = u.FechaUpdate
                })
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

            return new PagedResult<UsuarioDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = totalPages,
                HasNextPage = request.Page < totalPages,
                HasPreviousPage = request.Page > 1
            };
        }

        // Paginación basada en cursor (más eficiente para grandes volúmenes)
        public async Task<CursorPagedResult<UsuarioDto>> GetUsuariosCursorPaginatedAsync(CursorPaginationRequest request)
        {
            var query = _context.Usuarios.AsNoTracking().AsQueryable();

            // Aplicar filtros de búsqueda
            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                query = query.Where(u => 
                    u.CodigoUsuario.Contains(request.SearchTerm) ||
                    u.Nombre.Contains(request.SearchTerm) ||
                    u.Apellidos.Contains(request.SearchTerm) ||
                    (u.Correo != null && u.Correo.Contains(request.SearchTerm)));
            }

            // Aplicar cursor (paginación basada en ID)
            if (!string.IsNullOrEmpty(request.LastId))
            {
                if (request.SortDescending)
                {
                    query = query.Where(u => string.Compare(u.CodigoUsuario, request.LastId) < 0);
                }
                else
                {
                    query = query.Where(u => string.Compare(u.CodigoUsuario, request.LastId) > 0);
                }
            }

            // Aplicar ordenamiento
            query = ApplySorting(query, request.SortBy ?? "CodigoUsuario", request.SortDescending);

            // Tomar un elemento extra para determinar si hay más páginas
            var items = await query
                .Take(request.PageSize + 1)
                .Select(u => new UsuarioDto
                {
                    CodigoUsuario = u.CodigoUsuario,
                    Nombre = u.Nombre,
                    Apellidos = u.Apellidos,
                    NombreCompleto = u.NombreCompleto,
                    Correo = u.Correo,
                    Rol = u.Rol,
                    Telefono = u.Telefono,
                    Permisos = u.Permisos,
                    ImagenPerfil = u.ImagenPerfil,
                    Activo = u.Activo,
                    FechaCreacion = u.FechaCreacion,
                    FechaUpdate = u.FechaUpdate
                })
                .ToListAsync();

            var hasNextPage = items.Count > request.PageSize;
            if (hasNextPage)
            {
                items.RemoveAt(items.Count - 1); // Remover el elemento extra
            }

            string? nextCursor = null;
            string? previousCursor = null;

            if (items.Any())
            {
                nextCursor = hasNextPage ? items.Last().CodigoUsuario : null;
                previousCursor = !string.IsNullOrEmpty(request.LastId) ? items.First().CodigoUsuario : null;
            }

            return new CursorPagedResult<UsuarioDto>
            {
                Items = items,
                HasNextPage = hasNextPage,
                HasPreviousPage = !string.IsNullOrEmpty(request.LastId),
                NextCursor = nextCursor,
                PreviousCursor = previousCursor,
                PageSize = request.PageSize
            };
        }

        // Búsqueda avanzada con múltiples filtros
        public async Task<PagedResult<UsuarioDto>> SearchUsuariosAsync(UsuarioSearchRequest request)
        {
            var query = _context.Usuarios.AsNoTracking().AsQueryable();

            // Aplicar filtros específicos
            if (!string.IsNullOrEmpty(request.CodigoUsuario))
            {
                query = query.Where(u => u.CodigoUsuario.Contains(request.CodigoUsuario));
            }

            if (!string.IsNullOrEmpty(request.Nombre))
            {
                query = query.Where(u => u.Nombre.Contains(request.Nombre));
            }

            if (!string.IsNullOrEmpty(request.Apellidos))
            {
                query = query.Where(u => u.Apellidos.Contains(request.Apellidos));
            }

            if (!string.IsNullOrEmpty(request.Correo))
            {
                query = query.Where(u => u.Correo != null && u.Correo.Contains(request.Correo));
            }

            if (!string.IsNullOrEmpty(request.Rol))
            {
                query = query.Where(u => u.Rol == request.Rol);
            }

            if (!string.IsNullOrEmpty(request.Telefono))
            {
                query = query.Where(u => u.Telefono != null && u.Telefono.Contains(request.Telefono));
            }

            if (request.Activo.HasValue)
            {
                query = query.Where(u => u.Activo == request.Activo.Value);
            }

            if (request.FechaCreacionDesde.HasValue)
            {
                query = query.Where(u => u.FechaCreacion >= request.FechaCreacionDesde.Value);
            }

            if (request.FechaCreacionHasta.HasValue)
            {
                query = query.Where(u => u.FechaCreacion <= request.FechaCreacionHasta.Value);
            }

            // Contar total
            var totalCount = await query.CountAsync();

            // Aplicar ordenamiento
            query = ApplySorting(query, request.SortBy, request.SortDescending);

            // Aplicar paginación
            var items = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(u => new UsuarioDto
                {
                    CodigoUsuario = u.CodigoUsuario,
                    Nombre = u.Nombre,
                    Apellidos = u.Apellidos,
                    NombreCompleto = u.NombreCompleto,
                    Correo = u.Correo,
                    Rol = u.Rol,
                    Telefono = u.Telefono,
                    Permisos = u.Permisos,
                    ImagenPerfil = u.ImagenPerfil,
                    Activo = u.Activo,
                    FechaCreacion = u.FechaCreacion,
                    FechaUpdate = u.FechaUpdate
                })
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

            return new PagedResult<UsuarioDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = totalPages,
                HasNextPage = request.Page < totalPages,
                HasPreviousPage = request.Page > 1
            };
        }

        // Obtener usuario por código
        public async Task<UsuarioDto?> GetUsuarioByCodigoAsync(string codigoUsuario)
        {
            var usuario = await _context.Usuarios
                .AsNoTracking()
                .Where(u => u.CodigoUsuario == codigoUsuario)
                .Select(u => new UsuarioDto
                {
                    CodigoUsuario = u.CodigoUsuario,
                    Nombre = u.Nombre,
                    Apellidos = u.Apellidos,
                    NombreCompleto = u.NombreCompleto,
                    Correo = u.Correo,
                    Rol = u.Rol,
                    Telefono = u.Telefono,
                    Permisos = u.Permisos,
                    ImagenPerfil = u.ImagenPerfil,
                    Activo = u.Activo,
                    FechaCreacion = u.FechaCreacion,
                    FechaUpdate = u.FechaUpdate
                })
                .FirstOrDefaultAsync();

            return usuario;
        }

        // Crear usuario
        public async Task<UsuarioDto> CreateUsuarioAsync(CrearUsuarioRequest request)
        {
            var usuario = new Usuario
            {
                CodigoUsuario = request.CodigoUsuario,
                Nombre = request.Nombre,
                Apellidos = request.Apellidos,
                Correo = request.Correo,
                Rol = request.Rol,
                Telefono = request.Telefono,
                Contrasena = BCrypt.Net.BCrypt.HashPassword(request.Contrasena),
                Permisos = request.Permisos,
                ImagenPerfil = request.ImagenPerfil,
                Activo = true,
                FechaCreacion = DateTime.UtcNow,
                FechaUpdate = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var usuarioDto = new UsuarioDto
            {
                CodigoUsuario = usuario.CodigoUsuario,
                Nombre = usuario.Nombre,
                Apellidos = usuario.Apellidos,
                NombreCompleto = usuario.NombreCompleto,
                Correo = usuario.Correo,
                Rol = usuario.Rol,
                Telefono = usuario.Telefono,
                Permisos = usuario.Permisos,
                ImagenPerfil = usuario.ImagenPerfil,
                Activo = usuario.Activo,
                FechaCreacion = usuario.FechaCreacion,
                FechaUpdate = usuario.FechaUpdate
            };

            _logger.LogDebug("Usuario creado: {CodigoUsuario}", usuario.CodigoUsuario);

            return usuarioDto;
        }

        // Actualizar usuario
        public async Task<UsuarioDto?> UpdateUsuarioAsync(string codigoUsuario, ActualizarUsuarioRequest request)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.CodigoUsuario == codigoUsuario);

            if (usuario == null)
            {
                return null;
            }

            // Actualizar campos
            usuario.Nombre = request.Nombre;
            usuario.Apellidos = request.Apellidos;
            usuario.Correo = request.Correo;
            usuario.Rol = request.Rol;
            usuario.Telefono = request.Telefono;
            if (!string.IsNullOrEmpty(request.Permisos))
            {
                usuario.Permisos = request.Permisos;
            }
            usuario.ImagenPerfil = request.ImagenPerfil;
            if (request.Activo.HasValue)
            {
                usuario.Activo = request.Activo.Value;
            }
            usuario.FechaUpdate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var usuarioDto = new UsuarioDto
            {
                CodigoUsuario = usuario.CodigoUsuario,
                Nombre = usuario.Nombre,
                Apellidos = usuario.Apellidos,
                NombreCompleto = usuario.NombreCompleto,
                Correo = usuario.Correo,
                Rol = usuario.Rol,
                Telefono = usuario.Telefono,
                Permisos = usuario.Permisos,
                ImagenPerfil = usuario.ImagenPerfil,
                Activo = usuario.Activo,
                FechaCreacion = usuario.FechaCreacion,
                FechaUpdate = usuario.FechaUpdate
            };

            _logger.LogDebug("Usuario actualizado: {CodigoUsuario}", codigoUsuario);

            return usuarioDto;
        }

        // Eliminar usuario (soft delete)
        public async Task<bool> DeleteUsuarioAsync(string codigoUsuario)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.CodigoUsuario == codigoUsuario);

            if (usuario == null)
            {
                return false;
            }

            // Soft delete - marcar como inactivo
            usuario.Activo = false;
            usuario.FechaUpdate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogDebug("Usuario eliminado (soft delete): {CodigoUsuario}", codigoUsuario);

            return true;
        }

        // Método optimizado para obtener solo información básica (más rápido)
        public async Task<PagedResult<object>> GetUsuariosBasicInfoAsync(UsuarioPaginationRequest request)
        {
            var query = _context.Usuarios.AsNoTracking().AsQueryable();

            // Aplicar filtros
            query = ApplyFilters(query, request);

            // Contar total antes de paginación
            var totalCount = await query.CountAsync();

            // Aplicar ordenamiento
            query = ApplySorting(query, request.SortBy, request.SortDescending);

            // Proyección mínima para mejor rendimiento
            var items = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(u => new 
                {
                    u.CodigoUsuario,
                    u.Nombre,
                    u.Apellidos,
                    NombreCompleto = u.Nombre + " " + u.Apellidos,
                    u.Rol,
                    u.Activo
                })
                .ToListAsync();

            var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

            return new PagedResult<object>
            {
                Items = items.Cast<object>().ToList(),
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = totalPages,
                HasNextPage = request.Page < totalPages,
                HasPreviousPage = request.Page > 1
            };
        }

        // Método para obtener estadísticas optimizado
        public async Task<object> GetUsuarioStatsOptimizedAsync()
        {
            _logger.LogDebug("Calculando estadísticas desde la base de datos");

            // Usar consultas paralelas para mejor rendimiento
            var totalTask = _context.Usuarios.AsNoTracking().CountAsync();
            var activosTask = _context.Usuarios.AsNoTracking().CountAsync(u => u.Activo);
            var inactivosTask = _context.Usuarios.AsNoTracking().CountAsync(u => !u.Activo);
            
            // Estadísticas por rol
            var roleStatsTask = _context.Usuarios
                .AsNoTracking()
                .GroupBy(u => u.Rol)
                .Select(g => new { Rol = g.Key, Count = g.Count() })
                .ToListAsync();

            // Últimos usuarios
            var ultimosUsuariosTask = _context.Usuarios
                .AsNoTracking()
                .OrderByDescending(u => u.FechaCreacion)
                .Take(5)
                .Select(u => new { u.CodigoUsuario, u.NombreCompleto, u.FechaCreacion })
                .ToListAsync();

            // Esperar todas las consultas
            await Task.WhenAll(totalTask, activosTask, inactivosTask, roleStatsTask, ultimosUsuariosTask);

            var total = await totalTask;
            var activos = await activosTask;
            var inactivos = await inactivosTask;
            var roleStats = await roleStatsTask;
            var ultimosUsuarios = await ultimosUsuariosTask;

            var stats = new
            {
                TotalUsuarios = total,
                UsuariosActivos = activos,
                UsuariosInactivos = inactivos,
                PorcentajeActivos = total > 0 ? (double)activos / total * 100 : 0,
                EstadisticasPorRol = roleStats,
                UltimosUsuarios = ultimosUsuarios,
                FechaActualizacion = DateTime.UtcNow
            };

            _logger.LogDebug("Estadísticas calculadas");

            return stats;
        }

        // Método para verificar existencia (muy optimizado)
        public async Task<bool> ExistsUsuarioAsync(string codigoUsuario)
        {
            return await _context.Usuarios
                .AsNoTracking()
                .AnyAsync(u => u.CodigoUsuario == codigoUsuario);
        }

        // Método para contar usuarios por filtros (optimizado)
        public async Task<int> CountUsuariosAsync(UsuarioPaginationRequest request)
        {
            var query = _context.Usuarios.AsNoTracking().AsQueryable();
            query = ApplyFilters(query, request);
            return await query.CountAsync();
        }

        // Métodos auxiliares privados
        private IQueryable<Usuario> ApplyFilters(IQueryable<Usuario> query, UsuarioPaginationRequest request)
        {
            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                query = query.Where(u => 
                    u.CodigoUsuario.Contains(request.SearchTerm) ||
                    u.Nombre.Contains(request.SearchTerm) ||
                    u.Apellidos.Contains(request.SearchTerm) ||
                    (u.Correo != null && u.Correo.Contains(request.SearchTerm)));
            }

            if (!string.IsNullOrEmpty(request.Rol))
            {
                query = query.Where(u => u.Rol == request.Rol);
            }

            if (request.Activo.HasValue)
            {
                query = query.Where(u => u.Activo == request.Activo.Value);
            }

            if (request.FechaCreacionDesde.HasValue)
            {
                query = query.Where(u => u.FechaCreacion >= request.FechaCreacionDesde.Value);
            }

            if (request.FechaCreacionHasta.HasValue)
            {
                query = query.Where(u => u.FechaCreacion <= request.FechaCreacionHasta.Value);
            }

            return query;
        }

        private IQueryable<Usuario> ApplySorting(IQueryable<Usuario> query, string? sortBy, bool sortDescending)
        {
            if (string.IsNullOrEmpty(sortBy))
            {
                sortBy = "FechaCreacion";
            }

            Expression<Func<Usuario, object>> keySelector = sortBy.ToLower() switch
            {
                "codigousuario" => u => u.CodigoUsuario,
                "nombre" => u => u.Nombre,
                "apellidos" => u => u.Apellidos,
                "correo" => u => u.Correo ?? "",
                "rol" => u => u.Rol,
                "telefono" => u => u.Telefono ?? "",
                "activo" => u => u.Activo,
                "fechacreacion" => u => u.FechaCreacion,
                "fechaupdate" => u => u.FechaUpdate,
                _ => u => u.FechaCreacion
            };

            return sortDescending 
                ? query.OrderByDescending(keySelector)
                : query.OrderBy(keySelector);
        }
    }
}