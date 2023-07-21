import { useQuery } from "@tanstack/react-query";
import { searchByTags } from "../services/files";
import File from "./File";
import './FileList.css';

const FileList = () => {

  const filesQuery = useQuery(["files"], searchByTags);

  if (filesQuery.isLoading) return <h2>Loading...</h2>
  if (filesQuery.isError) {
    const errorMessage = filesQuery.error instanceof Error ? filesQuery.error.message : "An error occurred.";
    return <h2>{errorMessage}</h2>
  }

  return (
    <div>
      <div className="file-list">
        <ul>
          {filesQuery.data.map((file) => (
            <li key={file.id}>
              <File file={file}/>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FileList;
