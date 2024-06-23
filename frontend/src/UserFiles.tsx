import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Grid,
  Card,
  CardMedia,
  Divider,
  Typography,
  Box,
  Link,
  Icon,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  IconButton,
  CardActionArea,
  CardMediaTypeMap,
} from '@mui/material';
import { CardMediaProps } from '@mui/material/CardMedia';
import { FileOpen as OtherIcon } from '@mui/icons-material';
import { blueGrey } from '@mui/material/colors';

/*
// Component to handle different types of media files
const MediaFile = ({ url }: { url: string }) => {
  const attrs = {
    component: url.endsWith('.mp4') ? 'video' : ['png', 'jpg', 'jpeg', 'gif', 'heic'].includes(url.toLowerCase().split('.').pop()!) ? 'img' : 'other',
    sx: { height: 140 },
  };

  return attrs.component === 'video' ? (
    <CardMedia {...attrs} controls src={url} />
  ) : attrs.component === 'img' ? (
    <CardMedia {...attrs} image={url} />
  ) : (
    <CardMedia {...attrs} />
  );
};

*/

interface UrlMediaCardProps extends CardMediaProps {
  url: string;
}

const UrlCardMedia: React.FC<UrlMediaCardProps> = ({
  ...props
}: UrlMediaCardProps) => {
  const [src, setSrc] = useState<string | undefined>(undefined);

  const onClick = () => {
    setSrc(props.url);
  };

  return (
    <CardMedia
      component="video"
      src={src}
      onClick={onClick}
      {...props}
      controls={true}
    />
  );
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
    <UrlCardMedia component="video" url={url} {...props} />
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

const UserFiles = ({ uid, upUrls }: { uid: string; upUrls: string[] }) => {
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
      setFiles(files.concat(upUrls.map((url) => ({ url, fs: 'fs' }))));
    }
  }, [uid, upUrls]);

  if (files.length === 0) {
    return <Box>No files found for UID: {uid}</Box>;
  }

  return (
    <>
      <Divider
        sx={{
          width: '2px',
          backgroundColor: '#78909c',
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

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {files.map((file, index) => (
            <Card
              key={index}
              sx={{
                display: 'flex',
                minWidth: '200px',

                flexDirection: 'row',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  p: 1,
                  flexGrow: 1,
                  overflow: 'hidden',

                  alignItems: 'center',
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

                <MediaFile url={file.url} key={index} />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default UserFiles;
