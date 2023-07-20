import { TaggerFile } from "../types";
import File from "./File";
import './FileList.css';

const FileList = ({ files }: { files: TaggerFile[] }) => {

  return (
    <div>
      <div className="file-list">
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              <File name={file.name} id={file.id}/>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileList;
