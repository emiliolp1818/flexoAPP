using System.ComponentModel.DataAnnotations;

namespace FlexoAuthBackend.Models
{
    // Modelo base para paginación
    public class PaginationRequest
    {
        [Range(1, int.MaxValue, ErrorMessage = "La página debe ser mayor a 0")]
        public int Page { get; set; } = 1;
        
        [Range(1, 100, ErrorMessage = "El tamaño de página debe estar entre 1 y 100")]
        public int PageSize { get; set; } = 10;
        
        public string? SearchTerm { get; set; }
        public string? SortBy { get; set; }
        public bool SortDescending { get; set; } = false;
    }

    // Modelo para paginación basada en cursor
    public class CursorPaginationRequest
    {
        [Range(1, 100, ErrorMessage = "El tamaño de página debe estar entre 1 y 100")]
        public int PageSize { get; set; } = 10;
        
        public string? LastId { get; set; }
        public string? SearchTerm { get; set; }
        public string? SortBy { get; set; }
        public bool SortDescending { get; set; } = false;
    }

    // Respuesta paginada genérica
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
        public string? NextCursor { get; set; }
        public string? PreviousCursor { get; set; }
    }

    // Respuesta para paginación basada en cursor
    public class CursorPagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
        public string? NextCursor { get; set; }
        public string? PreviousCursor { get; set; }
        public int PageSize { get; set; }
    }

    // Modelo específico para paginación de usuarios
    public class UsuarioPaginationRequest : PaginationRequest
    {
        public string? Rol { get; set; }
        public bool? Activo { get; set; }
        public DateTime? FechaCreacionDesde { get; set; }
        public DateTime? FechaCreacionHasta { get; set; }
    }

    // Modelo para búsqueda avanzada de usuarios
    public class UsuarioSearchRequest
    {
        public string? CodigoUsuario { get; set; }
        public string? Nombre { get; set; }
        public string? Apellidos { get; set; }
        public string? Correo { get; set; }
        public string? Rol { get; set; }
        public string? Telefono { get; set; }
        public bool? Activo { get; set; }
        public DateTime? FechaCreacionDesde { get; set; }
        public DateTime? FechaCreacionHasta { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } = "FechaCreacion";
        public bool SortDescending { get; set; } = true;
    }
}