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
  Divider,
  Input,
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
  const [remember, setRemember] = useState(
    localStorage.getItem('remember') === 'true'
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleUIDChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUID(event.target.value);
  };

  const handleRememberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRemember(event.target.checked);
    localStorage.setItem('remember', event.target.checked.toString());
    if (remember) {
      localStorage.setItem('uid', uid || '');
    }
  };

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
    <Container
      maxWidth="xl"
      sx={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '200px' }}>
        <Typography variant="h4" component="h4" my={1}>
          Upload Files
        </Typography>

        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',

            height: '250px',
          }}
          noValidate
          autoComplete="off"
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <TextField
              label="Encryption User ID"
              variant="outlined"
              value={uid || ''}
              onChange={handleUIDChange}
            />

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                overflow: 'hidden',
                maxHeight: '50px',
              }}
            >
              <Typography>Remember me</Typography>
              <Checkbox
                name="remember"
                onChange={handleRememberChange}
                checked={remember}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Input
              type="file"
              onChange={handleFileChange}
              inputProps={{ multiple: true }}
              sx={{
                m: 0,
                p: 0,
              }}
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
        </Box>
        <Box>
          <Typography variant="h5" sx={{}}>
            Uploaded URLs
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {uploadedURLs.map((url, index) => (
              <a key={index} href={url} target="_blank" rel="noreferrer">
                {url.replace(RegExp('^.*/files'), '')}
              </a>
            ))}
          </Box>
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
      </Box>
      {uid ? (
        <UserFiles uid={uid} upUrls={uploadedURLs} />
      ) : (
        <Typography sx={{ m: 5 }} variant="h5">
          ... enter User ID to view files ...
        </Typography>
      )}
    </Container>
  );
};

export default FileUpload;
