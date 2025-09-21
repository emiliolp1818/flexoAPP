using Microsoft.EntityFrameworkCore;
using FlexoSpringAPI.Models;

namespace FlexoSpringAPI.Data
{
    public class FlexoDbContext : DbContext
    {
        public FlexoDbContext(DbContextOptions<FlexoDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración adicional para User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.CodigoUsuario);
                entity.Property(e => e.FechaCreacion)
                    .HasColumnType("TIMESTAMP")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UltimoAcceso)
                    .HasColumnType("TIMESTAMP");
                entity.Property(e => e.Rol).HasDefaultValue("usuario");
                entity.Property(e => e.Activo).HasDefaultValue(true);
                entity.Property(e => e.Foto).HasColumnType("LONGBLOB");
            });

            // Sin datos de prueba - la base de datos estará vacía inicialmente
        }
    }
}