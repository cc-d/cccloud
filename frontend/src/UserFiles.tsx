import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Card, CardMedia, Typography, Box } from '@mui/material';


const UserFiles = ({ uid }: { uid: string }) => {
  const [files, setFiles] = useState<{ url: string; fs: string }[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      if (uid) {
        const response = await axios.get(`http://localhost:8000/files/${uid}`);
        setFiles(response.data);
      }
    };

    fetchFiles();
  }, [uid]);

  return (
    <Box>
      <Typography variant="h6">Files</Typography>
      <Grid container spacing={2}>
        {files.map((file, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia component="img" image={file.url} alt={`file-${index}`} />
              <CardMedia component="img" image={file.fs} alt={`file-${index}`} />
              <Typography variant="body2">{file.url}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UserFiles;
