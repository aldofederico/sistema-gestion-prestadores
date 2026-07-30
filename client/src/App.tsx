import {
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  Typography
} from "@mui/material";

const technologies = ["React", "TypeScript", "Express", "Prisma", "PostgreSQL"];

export default function App() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        alignItems: "center",
        display: "flex",
        py: { xs: 4, md: 8 }
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4,
            p: { xs: 3, sm: 5, md: 7 }
          }}
        >
          <Stack spacing={4}>
            <Box>
              <Typography color="primary" gutterBottom sx={{ fontWeight: 700 }}>
                Fundación técnica operativa
              </Typography>
              <Typography component="h1" variant="h3" sx={{ fontWeight: 700 }}>
                Sistema de Gestión de Prestadores
              </Typography>
            </Box>

            <Typography color="text.secondary" variant="h6">
              Base reproducible para administrar prestadores con una arquitectura
              web de origen único.
            </Typography>

            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
              {technologies.map((technology) => (
                <Chip key={technology} label={technology} variant="outlined" />
              ))}
            </Stack>

            <Typography color="text.secondary">
              La funcionalidad de gestión será incorporada en las siguientes
              etapas del proyecto.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
