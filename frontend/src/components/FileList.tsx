import { TaggerFile } from "../types";
import File from "./File";
import './FileList.css';
import {getFiles} from "../services/file";
import {useEffect, useState} from "react";

const FileList = () => {
  const [files,setFiles] = useState<TaggerFile[]>([]);
  useEffect(
    () => {
      getFiles().then((files) => {
        setFiles(files);
      })
    }
  )

  return (
    <div>
      <div className="file-list">
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              <File name={file.name} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileList;
