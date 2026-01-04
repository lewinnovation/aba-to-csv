import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { Box, Button, Paper, Typography, Alert } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileSelect, disabled = false }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file extension
    if (!file.name.toLowerCase().endsWith('.aba')) {
      setError('Please upload a valid ABA file (.aba extension)');
      return false;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={dragActive ? 8 : 2}
        sx={{
          p: 4,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.3s ease',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".aba"
          onChange={handleChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />

        <CloudUploadIcon
          sx={{
            fontSize: 64,
            color: dragActive ? 'primary.main' : 'action.active',
            mb: 2,
          }}
        />

        <Typography variant="h6" gutterBottom>
          Drop your ABA file here
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or
        </Typography>

        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            handleButtonClick();
          }}
        >
          Choose File
        </Button>

        <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
          Accepts .aba files up to 10MB
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
