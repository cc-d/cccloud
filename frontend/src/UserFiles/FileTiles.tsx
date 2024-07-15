import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { Divider, Typography, Box, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { EncFile } from '../types';
import { getDirectoriesAndFiles } from './utils';
import { DirFile } from './comps';

const UserFiles = ({
  uid,
  upUrls,
  secret,
}: {
  uid: string;
  upUrls: EncFile[];
  secret: string;
}) => {
  const [loading, setLoading] = useState<boolean | null>(null);
  const [files, setFiles] = useState<EncFile[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const fsPath = searchParams.get('path') || '';
  const fileDirWidth = 200;
  const [numCols, setNumCols] = useState(
    Math.floor((window.innerWidth - 36) / fileDirWidth)
  );
  const [cols, setCols] = useState<Array<Array<string | EncFile>>>([]);

  useEffect(() => {
    console.log('loading', loading);
    if (loading === null) {
      setLoading(true);
    }
  });
  const fetchFiles = async () => {
    if (uid) {
      try {
        const response = await axios.get(`http://localhost:8000/files/${uid}`);
        setFiles(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [uid, upUrls, loading]);

  useEffect(() => {
    const handleResize = () => {
      const newNumCols = Math.floor((window.innerWidth - 36) / fileDirWidth);
      setNumCols(newNumCols);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fileDirWidth]);

  const makeCols = (fileOrDir: Array<string | EncFile>, numCols: number) => {
    const cols = Array.from(
      { length: numCols },
      () => [] as Array<string | EncFile>
    );
    fileOrDir.forEach((item, index) => {
      cols[index % numCols].push(item);
    });
    return cols;
  };

  useEffect(() => {
    const makeCols = (fileOrDir: Array<string | EncFile>, numCols: number) => {
      const cols = Array.from(
        { length: numCols },
        () => [] as Array<string | EncFile>
      );
      fileOrDir.forEach((item, index) => {
        cols[index % numCols].push(item);
      });
      return cols;
    };

    const allFiles = getDirectoriesAndFiles(files, fsPath);
    const curFiles = allFiles.files;
    const curDirs = allFiles.directories;

    const allItems = [...curDirs, ...curFiles];
    const newCols = makeCols(allItems, numCols);
    setCols(newCols);
  }, [files, numCols, fsPath]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

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

  const handleFileClick = (file: EncFile) => {
    if (!file.relpath.toLowerCase().endsWith('.mp4')) {
      window.location.href = `http://localhost:8000/files/${uid}/dl/${file.relpath}?secret=${secret}`;
    }
  };

  if (!files.length) {
    return <Box>No files found for UID: {uid}</Box>;
  }

  return (
    <Box
      sx={{
        mt: -4,
        m: 0,
        p: 0,
        width: '100vw',
        display: 'flex',
        alignSelf: 'center',
        maxWidth: 'calc(100vw - 36px)',
      }}
    >
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
          gap: 1,
        }}
      >
        {cols.map((col, colIndex) => (
          <Box
            key={colIndex}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              maxWidth: `calc(min(${100 / numCols}%, 96vw))`,
            }}
          >
            {col.map((item, index) =>
              typeof item === 'string' ? (
                <DirFile
                  width={fileDirWidth}
                  dir={item}
                  secret={secret}
                  onClick={() => handleDirectoryClick(item)}
                />
              ) : (
                <DirFile
                  width={fileDirWidth}
                  file={item}
                  secret={secret}
                  onClick={() => handleFileClick(item)}
                />
              )
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default UserFiles;
