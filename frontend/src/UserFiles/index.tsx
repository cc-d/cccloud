import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Divider, Typography, Box, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { EncFile } from '../types';
import { getDirectoriesAndFiles } from './utils';
import { DirFile } from './comps';

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
  const fileDirWidth = 200;
  const numCols = Math.floor((window.innerWidth - 36) / fileDirWidth);
  const [cols, setCols] = useState<Array<Array<string | EncFile>>>([]);

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

    const allItems = [...directories, ...fileList];
    setCols(makeCols(allItems, numCols));
  }, [directories, fileList, numCols]);

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
    window.location.href = `http://localhost:8000/files/${cccId}/dl/${file.relpath}?secret=${secret}`;
  };

  if (!files.length) {
    return <Box>No files found for UID: {cccId}</Box>;
  }

  return (
    <Box sx={{ mt: -4, width: '100%', maxWidth: 'calc(100vw - 36px)' }}>
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
              maxWidth: `${100 / numCols}%`, // Ensure each column takes equal width
            }}
          >
            {col.map((item, index) =>
              typeof item === 'string' ? (
                <DirFile
                  key={index}
                  width={fileDirWidth}
                  dir={item}
                  secret={secret}
                  onClick={() => handleDirectoryClick(item)}
                />
              ) : (
                <DirFile
                  key={index}
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
