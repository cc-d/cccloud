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
import { MediaFile, ItemCard, DirFile } from './comps';

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
    <Box sx={{ mt: -4 }}>
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {fsPath && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <Typography sx={{ my: 1, maxHeight: 28 }}>{fsPath}</Typography>
              <Button
                onClick={handleBackClick}
                variant="contained"
                color="primary"
                size="small"
                sx={{
                  display: 'flex',
                  maxHeight: 28,

                  fontWeight: 'bold',
                }}
              >
                &lt;- {fsPath.replace(/[^/]+$/, '')}
              </Button>
            </Box>
          )}
          <Divider
            sx={{
              my: 1,
            }}
          />
        </Box>
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
            <DirFile
              key={index}
              file={file}
              secret={secret}
              onClick={() => {}}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default UserFiles;
