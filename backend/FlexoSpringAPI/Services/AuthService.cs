using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FlexoSpringAPI.Data;
using FlexoSpringAPI.Models;

namespace FlexoSpringAPI.Services
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task<bool> ValidateTokenAsync(string token);
    }

    public class AuthService : IAuthService
    {
        private readonly FlexoDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(FlexoDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.CodigoUsuario == request.CodigoUsuario && u.Activo);

                if (user == null)
                {
                    return new LoginResponse
                    {
                        Success = false,
                        Message = "Código de usuario no encontrado"
                    };
                }

                if (!BCrypt.Net.BCrypt.Verify(request.Contrasena, user.Contrasena))
                {
                    return new LoginResponse
                    {
                        Success = false,
                        Message = "Contraseña incorrecta"
                    };
                }

                // Actualizar último acceso
                user.UltimoAcceso = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Generar token JWT
                var token = GenerateJwtToken(user);

                return new LoginResponse
                {
                    Success = true,
                    Message = "Login exitoso",
                    Token = token,
                    User = new UserInfo
                    {
                        CodigoUsuario = user.CodigoUsuario,
                        Nombre = user.Nombre,
                        Apellido = user.Apellido,
                        Rol = user.Rol,
                        FotoBase64 = user.Foto != null ? Convert.ToBase64String(user.Foto) : null
                    }
                };
            }
            catch (Exception ex)
            {
                return new LoginResponse
                {
                    Success = false,
                    Message = $"Error interno del servidor: {ex.Message}"
                };
            }
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "");
                
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "");
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.CodigoUsuario),
                    new Claim(ClaimTypes.Name, user.CodigoUsuario),
                    new Claim("nombre", user.Nombre),
                    new Claim("apellido", user.Apellido),
                    new Claim(ClaimTypes.Role, user.Rol),
                    new Claim("foto", user.Foto != null ? Convert.ToBase64String(user.Foto) : "")
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}