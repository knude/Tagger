import { useQuery } from "@tanstack/react-query";
import { getUserFiles } from "../services/files";
import { TaggerFile } from "../utils/types";
import File from "./File";

const UserFiles = () => {
  const fileQuery = useQuery(["files","user"], getUserFiles);

  return (
    <div className="file-list">
      <h2>My Files</h2>
      {fileQuery.isLoading && <h2>Loading...</h2>}
      {fileQuery.isError && <h2>An error occurred.</h2>}
      {fileQuery.data && (
        <div>
          <ul>
            {fileQuery.data.files.map((file: TaggerFile) => (
              <li className="center-children" key={file.id}>
                <File file={file} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default UserFiles;