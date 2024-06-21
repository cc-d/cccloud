import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Checkbox,

} from '@mui/material';
import UserFiles from './UserFiles';

import axios from 'axios';

const FileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedURLs, setUploadedURLs] = useState<string[]>([]);
  const [uid, setUID] = useState<string | null>(null);
  const [remember, setRemember] = useState(localStorage.getItem('remember') === 'true');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleUIDChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUID(event.target.value);
  }


  const handleRememberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRemember(event.target.checked);
    localStorage.setItem('remember', event.target.checked.toString());
    if (remember) {
      localStorage.setItem('uid', uid || '');
    }
  }

  const handleUpload = async () => {
    if (!files.length || !uid) {
      setError('Please provide both files and a uid.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const uploadedUrlsTemp: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.put(
          `http://localhost:8000/files/${uid}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        if (response.status === 201) {
          uploadedUrlsTemp.push(response.data.url);
        }
      }
      setUploadedURLs([...uploadedURLs, ...uploadedUrlsTemp]);
      setSuccess(true);
    } catch (err) {
      setError('Failed to upload files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (remember && uid === null) {
      setUID(localStorage.getItem('uid'));
    }

  });

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Upload Files
      </Typography>
      <Box
        component="form"
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        noValidate
        autoComplete="off"
      >
        <input type="file" multiple onChange={handleFileChange} />
        <TextField
          label="Encryption User ID"
          variant="outlined"
          value={uid || ''}
          onChange={handleUIDChange}

        />

        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <Typography>Remember me</Typography>
        <Checkbox name="remember" onChange={handleRememberChange} checked={remember} />

        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
      </Box>
      <Box>
        <Typography>Uploaded URLs: </Typography>
        <ul>
          {uploadedURLs.map((url, index) => (
            <li key={index}>
              <a href={url} target="_blank" rel="noreferrer">
                {url}
              </a>
            </li>
          ))}
        </ul>
      </Box>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Files uploaded successfully!
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

      {uid && <UserFiles uid={uid} />}
    </Container>
  );
};

export default FileUpload;
