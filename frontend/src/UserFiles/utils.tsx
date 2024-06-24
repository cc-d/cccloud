import { EncFile } from '../types';

export const getDirectoriesAndFiles = (
  files: EncFile[],
  path: string | undefined
) => {
  const directories = new Set<string>();
  const fileList: EncFile[] = [];

  files.forEach((file) => {
    const relativePath = file.relpath.replace(/^\//, '');
    if (relativePath.startsWith(path || '')) {
      const remainingPath = relativePath
        .slice((path || '').length)
        .replace(/^\//, '');
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

export const shortUrl = (url: string) => {
  return url.split('/').slice(-1)[0];
};
