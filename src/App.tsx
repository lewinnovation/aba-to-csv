import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import FileUpload from './components/FileUpload';
import ConversionStatus from './components/ConversionStatus';
import Footer from './components/Footer';
import { convertABAToWise, downloadCSV } from './lib/abaConverter';
import type { ConversionResult } from './lib/types';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h3: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
});

type ConversionState = 'idle' | 'processing' | 'success' | 'error';

function App() {
  const [state, setState] = useState<ConversionState>('idle');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  const handleFileSelect = async (file: File) => {
    setState('processing');
    setConversionResult(null);

    try {
      const result = await convertABAToWise(file);
      setConversionResult(result);

      if (result.success) {
        setState('success');
      } else {
        setState('error');
      }
    } catch (error) {
      setState('error');
      setConversionResult({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  const handleDownload = () => {
    if (conversionResult?.csvContent && conversionResult?.filename) {
      downloadCSV(conversionResult.csvContent, conversionResult.filename);
    }
  };

  const handleReset = () => {
    setState('idle');
    setConversionResult(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="md" sx={{ py: 8, flex: 1 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              ABA to Wise CSV Converter
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Convert Australian Banking Association (ABA) payroll files to Wise batch payment format
            </Typography>
          </Box>

          {/* Privacy Notice */}
          <Alert
            severity="info"
            icon={<SecurityIcon />}
            sx={{ mb: 4 }}
          >
            <Typography variant="subtitle2" gutterBottom>
              100% Private & Secure
            </Typography>
            <Typography variant="body2">
              Your ABA file is processed entirely in your browser. We do not collect, store, or transmit your data to any server. All conversion happens on your device for complete privacy.
            </Typography>
          </Alert>

          {/* Main Content */}
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <FileUpload
              onFileSelect={handleFileSelect}
              disabled={state === 'processing'}
            />

            <Box sx={{ mt: 3 }}>
              <ConversionStatus
                state={state}
                transactionCount={conversionResult?.transactionCount}
                error={conversionResult?.error}
                onDownload={handleDownload}
                onReset={handleReset}
              />
            </Box>
          </Paper>

          {/* How it Works */}
          <Paper elevation={1} sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              How It Works
            </Typography>
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Upload your ABA payroll file using the upload area above
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                The file is parsed and converted to Wise CSV format in your browser
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Download the generated CSV file
              </Typography>
              <Typography component="li" variant="body2">
                Upload the CSV to Wise for batch payments
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Need to check the code or use a command-line tool?{' '}
              <a
                href="https://github.com/lewinnovation/aba-to-csv"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                Visit our GitHub repository
              </a>
            </Typography>
          </Paper>
        </Container>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;
