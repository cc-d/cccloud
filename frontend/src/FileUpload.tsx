import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files ? event.target.files[0] : null);
  };

  const handleUpload = async () => {
    if (!file || !key) {
      setError('Please provide both a file and a key.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(
        `http://localhost:8000/upload/?key=${encodeURIComponent(key)}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (response.status === 201) {
        setSuccess(true);
      }
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Upload File
      </Typography>
      <Box
        component="form"
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        noValidate
        autoComplete="off"
      >
        <input type="file" onChange={handleFileChange} />
        <TextField
          label="Encryption Key"
          variant="outlined"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
      </Box>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          File uploaded successfully!
        </Alert>
      </Snackbar>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FileUpload;
