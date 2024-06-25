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
import { EncFile } from './types';

import axios from 'axios';

const FileUpload = ({
  cccId,
  secret,
}: {
  cccId: string | null;
  secret: string | null;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedURLs, setUploadedURLs] = useState<EncFile[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (!files.length || !cccId) {
      setError('Please provide both files and a cccId.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const uploaded: EncFile[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.put(
          `http://localhost:8000/files/${cccId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: cccId,
            },
          }
        );
        if (response.status === 201) {
          uploaded.push(response.data);
        }
      }
      setUploadedURLs(uploaded);
      console.log(uploaded);
      setSuccess(true);
    } catch (err) {
      setError('Failed to upload files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          Upload
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
              <a key={index} href={url.url} target="_blank" rel="noreferrer">
                {url.url.replace(RegExp('^.*/files'), '')}
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
      {cccId !== null && secret !== null ? (
        <UserFiles cccId={cccId} upUrls={uploadedURLs} secret={secret} />
      ) : (
        <Typography sx={{ m: 5 }} variant="h5">
          ... enter User ID to view files ...
        </Typography>
      )}
    </Container>
  );
};

export default FileUpload;
