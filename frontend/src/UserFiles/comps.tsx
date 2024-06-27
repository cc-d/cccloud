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
import {
  FileDownload as OtherIcon,
  PlayCircleFilled as PlayIcon,
} from '@mui/icons-material';
import FolderIcon from '@mui/icons-material/Folder';
import { useTheme } from '@mui/material/styles';
import { EncFile } from '../types';
import { shortUrl } from './utils';
interface UrlMediaCardProps {
  url: string;
}

const UrlCardMedia = ({ url }: UrlMediaCardProps) => {
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
            color: 'primary.main',
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

export const MediaFile = ({
  url,
  secret,
}: {
  url: string;
  secret: string | undefined;
}) => {
  const lurl = url.toLowerCase();
  const props = {
    sx: {
      display: 'flex',
      flexGrow: 1,
      maxWidth: 300,
      maxHeight: 300,
      color: 'primary.main',
    },
  };
  return lurl.endsWith('.mp4') ? (
    <UrlCardMedia url={`${url}?secret=${secret}`} {...props} />
  ) : ['png', 'jpg', 'jpeg', 'gif', 'heic'].includes(
      url.toLowerCase().split('.').pop()!
    ) ? (
    <CardMedia component="img" image={`${url}?secret=${secret}`} {...props} />
  ) : (
    <CardMedia
      sx={{ ...props['sx'], alignItems: 'center', justifyContent: 'center' }}
    >
      <Link href={`${url}?secret=${secret}`}>
        <OtherIcon sx={{ ...props['sx'], height: 150, width: 150 }} />
      </Link>
    </CardMedia>
  );
};

export const ItemCard = ({
  name,
  onClick,
  children,
}: {
  name: string;
  onClick?: () => void;
  children: React.ReactNode;
}) => (
  <Card
    sx={{
      display: 'flex',
      minWidth: '100px',
      maxWidth: '200px',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      cursor: onClick ? 'pointer' : 'default',
    }}
    onClick={onClick}
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
      {children}
    </CardContent>
  </Card>
);

export const DirFile = ({
  key,
  file,
  dir,
  onClick,
  fsPath,
  secret,
}: {
  key: number;
  dir?: string;
  file?: EncFile;
  onClick?: () => void;
  fsPath?: string;
  secret?: string;
}) => {
  const name = dir || shortUrl(file!.url);
  const href = file
    ? `${file.url}?secret=${secret}`
    : fsPath
    ? `${fsPath}/${dir}`
    : dir;
  const linkTxt = file ? shortUrl(file.url) : dir;

  const dfLink = (
    <Link
      href={href}
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
      {linkTxt}
    </Link>
  );

  if (file) {
    return (
      <ItemCard name={name} onClick={onClick}>
        {dfLink}
        <MediaFile url={file.url} secret={secret} />
      </ItemCard>
    );
  } else {
    return (
      <ItemCard name={name} onClick={onClick}>
        {dfLink}
        <FolderIcon sx={{ height: 80, width: 80 }} />
      </ItemCard>
    );
  }
};
