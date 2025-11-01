using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FlexoAuthBackend.Models;
using FlexoAuthBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace FlexoAuthBackend.Services
{
    public class AuthService
    {
        private readonly FlexoDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(FlexoDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<LoginResponse?> AuthenticateAsync(LoginRequest request)
        {
            var usuario = await _context.Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.CodigoUsuario == request.Username && u.Activo);

            if (usuario == null || !BCrypt.Net.BCrypt.Verify(request.Password, usuario.Contrasena))
            {
                return null;
            }

            // Actualizar fecha de último acceso
            usuario.FechaUpdate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(usuario);
            var expiresAt = DateTime.UtcNow.AddHours(24);

            return new LoginResponse
            {
                Token = token,
                Username = usuario.CodigoUsuario,
                CodigoUsuario = usuario.CodigoUsuario,
                Nombre = usuario.Nombre,
                Apellidos = usuario.Apellidos,
                NombreCompleto = usuario.NombreCompleto,
                Email = usuario.Correo ?? string.Empty,
                Rol = usuario.Rol,
                Permisos = usuario.Permisos,
                ImagenPerfil = usuario.ImagenPerfil,
                ExpiresAt = expiresAt
            };
        }

        private string GenerateJwtToken(Usuario usuario)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
            var key = Encoding.ASCII.GetBytes(jwtKey);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.CodigoUsuario),
                new Claim(ClaimTypes.Name, usuario.CodigoUsuario),
                new Claim(ClaimTypes.GivenName, usuario.Nombre),
                new Claim(ClaimTypes.Surname, usuario.Apellidos),
                new Claim(ClaimTypes.Email, usuario.Correo ?? string.Empty),
                new Claim(ClaimTypes.Role, usuario.Rol),
                new Claim("Permisos", usuario.Permisos),
                new Claim("NombreCompleto", usuario.NombreCompleto)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}