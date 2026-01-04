import { Box, Container, Typography, Link } from '@mui/material';
import { Favorite as FavoriteIcon, GitHub as GitHubIcon } from '@mui/icons-material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Made with{' '}
            <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} />{' '}
            by{' '}
            <Link
              href="https://www.lewinnovation.com"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="primary"
            >
              Lew Innovation
            </Link>
          </Typography>

          <Typography variant="body2" color="text.secondary">
            For more useful everyday tools
          </Typography>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link
            href="https://github.com/lewinnovation/aba-to-csv"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            color="text.secondary"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <GitHubIcon sx={{ fontSize: 18 }} />
            Command-line version on GitHub
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
