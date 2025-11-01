using Microsoft.AspNetCore.Mvc;
using FlexoAuthBackend.Models;
using FlexoAuthBackend.Services;

namespace FlexoAuthBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _authService.AuthenticateAsync(request);
            
            if (response == null)
            {
                return Unauthorized(new { message = "Credenciales inválidas" });
            }

            return Ok(response);
        }

        [HttpPost("validate")]
        public IActionResult ValidateToken()
        {
            return Ok(new { message = "Token válido" });
        }
    }
}