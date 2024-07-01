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

const UploadArea = ({
  handleFileChange,
  handleUpload,
  setSuccess,
  setError,
  loading,
  success,
  error,
}: {
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => void;
  setSuccess: (success: boolean) => void;
  setError: (error: string | null) => void;
  loading: boolean;
  success: boolean;
  error: string | null;
}) => {
  const [upDirs, setUpDirs] = useState<boolean>(false);
  const [inpProps, setInpProps] = useState<any>({});

  useEffect(() => {
    if (upDirs) {
      setInpProps({ webkitdirectory: 'true', multiple: true });
    } else {
      setInpProps({ multiple: true });
    }
  }, [upDirs]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        maxHeight: '50px',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'flex-start',
        mx: 1,
      }}
    >
      <Typography variant="h4" component="h4" my={1} mr={2}>
        Files
      </Typography>

      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexGrow: 1,
          alignItems: 'center',
          gap: 1,
        }}
        noValidate
        autoComplete="off"
      >
        <Input
          type="file"
          onChange={handleFileChange}
          inputProps={inpProps}
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
          size="small"
          sx={{ overflow: 'hidden', maxHeight: '30px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" component="h6">
            Directories
          </Typography>
          <Checkbox
            checked={upDirs}
            onChange={(e) => setUpDirs(e.target.checked)}
            color="primary"
            sx={{
              m: 0,
              p: 0,
            }}
          />
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
  );
};

const FileUpload = ({
  cccId,
  secret,
}: {
  cccId: string | null;
  secret: string | null;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadedURLs, setUploadedURLs] = useState<EncFile[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        flexDirection: 'column',
      }}
    >
      <UploadArea
        {...{
          handleFileChange,
          handleUpload,
          setSuccess,
          setError,
          loading,
          success,
          error,
        }}
      />

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
