import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Card, CardMedia, Divider, Typography, Box, Link } from '@mui/material';
import { FileCopy as UnknownFile } from '@mui/icons-material';

const shortUrl = (url: string) => {
    return url.split('/').slice(-1)[0];
    }

const UserFiles = ({ uid , upUrls} : {uid: string, upUrls: string[]}) => {
  const [files, setFiles] = useState<{ url: string; fs: string }[]>([]);
  const fetchFiles = async () => {
    if (uid) {
      try {

          const response = await axios.get(`http://localhost:8000/files/${uid}`);
          setFiles(response.data);
      } catch (error) {
          console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchFiles();
    if (upUrls.length > 0) {
      setFiles(files.concat(upUrls.map(url => ({ url, fs: 'fs' }))));
    }
  }, [uid, upUrls]);

  if (files.length === 0) {
    return <Box>No files found for UID: {uid}</Box>;
  }

  return (
    <Box>
        <Divider />
      <Typography variant="h6">Files</Typography>
      <Grid container spacing={2}>
        {files.map((file, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card
            sx={{
                backgroundColor: 'unset',
                minHeight: '100px',
                minWidth: '100px',
            }}
            >
                { file.url.endsWith('.mp4') ?
                  <CardMedia component="video" src={file.url} controls />
                 : ['jpg', 'jpeg', 'png', 'gif'].includes(file.url.toLowerCase().split('.').pop() || '') ?
                  <CardMedia component="img" image={file.url} alt={`file-${index}`} />
                    : <CardMedia component={UnknownFile} sx={{height: '100px', width: '100px'}} />
                }

              <Link href={file.url} target="_blank" rel="noreferrer">
                {shortUrl(file.url)}
                </Link>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UserFiles;
