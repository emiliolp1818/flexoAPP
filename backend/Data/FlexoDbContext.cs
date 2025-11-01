using Microsoft.EntityFrameworkCore;
using FlexoAuthBackend.Models;

namespace FlexoAuthBackend.Data
{
    public class FlexoDbContext : DbContext
    {
        public FlexoDbContext(DbContextOptions<FlexoDbContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.HasKey(e => e.CodigoUsuario);
                entity.HasIndex(e => e.CodigoUsuario).IsUnique();
                entity.HasIndex(e => e.Correo).IsUnique();
                
                // Configurar valores por defecto
                entity.Property(e => e.FechaCreacion)
                    .HasDefaultValueSql("GETUTCDATE()");
                    
                entity.Property(e => e.FechaUpdate)
                    .HasDefaultValueSql("GETUTCDATE()");
                    
                entity.Property(e => e.Activo)
                    .HasDefaultValue(true);
            });
        }
    }
}