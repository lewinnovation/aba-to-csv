import { Box, Typography, Alert, CircularProgress, Button } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Download as DownloadIcon } from '@mui/icons-material';

type ConversionState = 'idle' | 'processing' | 'success' | 'error';

interface ConversionStatusProps {
  state: ConversionState;
  transactionCount?: number;
  error?: string;
  onDownload?: () => void;
  onReset?: () => void;
}

export default function ConversionStatus({
  state,
  transactionCount,
  error,
  onDownload,
  onReset,
}: ConversionStatusProps) {
  if (state === 'idle') {
    return null;
  }

  if (state === 'processing') {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Converting your ABA file...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Processing in your browser
        </Typography>
      </Box>
    );
  }

  if (state === 'error') {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Conversion Failed
          </Typography>
          <Typography variant="body2">{error || 'An unknown error occurred'}</Typography>
        </Alert>
        <Button variant="outlined" onClick={onReset} fullWidth>
          Try Another File
        </Button>
      </Box>
    );
  }

  if (state === 'success') {
    return (
      <Box sx={{ py: 2 }}>
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Conversion Successful!
          </Typography>
          <Typography variant="body2">
            {transactionCount} {transactionCount === 1 ? 'transaction' : 'transactions'} converted
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={onDownload}
            fullWidth
            size="large"
          >
            Download CSV
          </Button>
          <Button variant="outlined" onClick={onReset} fullWidth size="large">
            Convert Another
          </Button>
        </Box>
      </Box>
    );
  }

  return null;
}
