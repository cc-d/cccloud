import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardMedia,
  Divider,
  Typography,
  Box,
  Link,
  CardContent,
  CardActionArea,
  Button,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import { useLocation, useNavigate } from 'react-router-dom';
import { EncFile } from '../types';
import { getDirectoriesAndFiles, shortUrl } from './utils';
import { MediaFile, ItemCard } from './comps';

const UserFiles = ({
  cccId,
  upUrls,
  secret,
}: {
  cccId: string;
  upUrls: EncFile[];
  secret: string;
}) => {
  const [files, setFiles] = useState<EncFile[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const fsPath = searchParams.get('path') || '';

  const fetchFiles = async () => {
    if (cccId) {
      try {
        const response = await axios.get(
          `http://localhost:8000/files/${cccId}`
        );
        setFiles(response.data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [cccId, upUrls]);

  const { directories, files: fileList } = getDirectoriesAndFiles(
    files,
    fsPath
  );

  const handleDirectoryClick = (dir: string) => {
    const newPath = fsPath ? `${fsPath}/${dir}` : dir;
    navigate(`?path=${newPath}`);
  };

  const handleBackClick = () => {
    const segments = fsPath.split('/').filter(Boolean);
    segments.pop();
    const newPath = segments.join('/');
    navigate(newPath ? `?path=${newPath}` : '');
  };

  if (!files.length) {
    return <Box>No files found for UID: {cccId}</Box>;
  }

  return (
    <>
      <Divider
        sx={{
          width: '2px',
          backgroundColor: 'primary.secondary',
          borderRadius: '8px',
          m: 1,
        }}
      />
      <Box
        sx={{
          ml: 1,
        }}
      >
        <Typography variant="h4" sx={{ my: 1 }}>
          Files
        </Typography>
        {fsPath && (
          <Button onClick={handleBackClick} variant="contained" color="primary">
            Back
          </Button>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {directories.map((dir, index) => (
            <ItemCard
              key={index}
              name={dir}
              onClick={() => handleDirectoryClick(dir)}
            >
              <Link
                href={`?path=${fsPath ? `${fsPath}/${dir}` : dir}`}
                variant="h6"
                component={'a'}
                sx={{
                  color: 'inherit',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {dir}
              </Link>
              <FolderIcon sx={{ height: 80, width: 80 }} />
            </ItemCard>
          ))}
          {fileList.map((file, index) => (
            <ItemCard key={index} name={shortUrl(file.url)}>
              <Link
                href={file.url}
                target="_blank"
                variant="h6"
                rel="noreferrer"
                component={'a'}
                sx={{
                  color: 'inherit',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {shortUrl(file.url)}
              </Link>
              <MediaFile url={file.url} />
            </ItemCard>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default UserFiles;
