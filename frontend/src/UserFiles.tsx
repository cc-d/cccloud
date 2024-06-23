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
import { EncFile } from './types';
import { FileOpen as OtherIcon, PlayCircleFilled as PlayIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface UrlMediaCardProps {
  url: string;
}

const getDirectoriesAndFiles = (files: EncFile[], path: string | undefined) => {
  if (!path) {
    return {
      directories: [],
      files: files,
    };
  }

  const directories = new Set<string>();
  const fileList: EncFile[] = [];

  files.forEach((file) => {
    const relativePath = file.relpath.replace(/^\//, '');
    if (relativePath.startsWith(path)) {
      const remainingPath = relativePath.slice(path.length).replace(/^\//, '');
      if (remainingPath.includes('/')) {
        directories.add(remainingPath.split('/')[0]);
      } else {
        fileList.push(file);
      }
    }
  });
  console.log('directories', directories, 'files', fileList);
  return {
    directories: Array.from(directories),
    files: fileList,
  };
};

const UrlCardMedia: React.FC<UrlMediaCardProps> = ({ url }: UrlMediaCardProps) => {
  const theme = useTheme();
  const [src, setSrc] = useState<string | undefined>(undefined);

  const onClick = () => {
    setSrc(url);
  };

  if (src) {
    return (
      <CardMedia
        component="video"
        src={src}
        onClick={onClick}
        controls={true}
        sx={{ display: 'flex', flexGrow: 1, maxWidth: 300, maxHeight: 300 }}
      />
    );
  } else {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          cursor: 'pointer',
          height: '100%',
        }}
        onClick={onClick}
      >
        <PlayIcon
          sx={{
            color: theme.palette.text.primary,
            height: 90,
            width: 90,
            opacity: 0.5,
            display: 'flex',
            alignItems: 'center',
          }}
        />
        <Typography variant="h5" color="text.primary">
          Click to play
        </Typography>
      </Box>
    );
  }
};

const MediaFile = ({ url }: { url: string }) => {
  const lurl = url.toLowerCase();
  const props = {
    sx: {
      display: 'flex',
      flexGrow: 1,
      maxWidth: 300,
      maxHeight: 300,
    },
  };
  return lurl.endsWith('.mp4') ? (
    <UrlCardMedia url={url} {...props} />
  ) : ['png', 'jpg', 'jpeg', 'gif', 'heic'].includes(
    url.toLowerCase().split('.').pop()!
  ) ? (
    <CardMedia component="img" image={url} {...props} />
  ) : (
    <CardMedia
      sx={{ ...props['sx'], alignItems: 'center', justifyContent: 'center' }}
    >
      <OtherIcon sx={{ ...props['sx'], height: 150, width: 150 }} />
    </CardMedia>
  );
};

const shortUrl = (url: string) => {
  return url.split('/').slice(-1)[0];
};

const UserFiles = ({ uid, upUrls }: { uid: string; upUrls: EncFile[] }) => {
  const [files, setFiles] = useState<EncFile[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const fsPath = searchParams.get('path') || '';

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
  }, [uid, upUrls]);

  const { directories, files: fileList } = getDirectoriesAndFiles(files, fsPath);

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
    return <Box>No files found for UID: {uid}</Box>;
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
            <Card
              key={index}
              sx={{
                display: 'flex',
                minWidth: '100px',
                maxWidth: '200px',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => handleDirectoryClick(dir)}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                }}
              >
                <FolderIcon fontSize="large" />
                <Typography variant="h6">{dir}</Typography>
              </CardContent>
            </Card>
          ))}
          {fileList.map((file, index) => (
            <Card
              key={index}
              sx={{
                display: 'flex',
                minWidth: '100px',
                maxWidth: '200px',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1,
                  flexGrow: 1,
                  overflow: 'hidden',
                }}
              >
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
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default UserFiles;
