import { useParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import { getFile } from "../services/file";
import { TaggerFile } from "../types";

const FileWindow = () => {
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<TaggerFile | null>(null);

  useEffect(() => {
    if(!id) return;
    getFile(Number(id)).then((file) => {
      setFile(file);
    });
  }, [id]);

  return (
    <div>
      {file && (
        <div>
          <h2>{file.name}</h2>
        </div>
      )}
    </div>
  );
};

export default FileWindow;