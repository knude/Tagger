import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { searchForFiles } from "../services/files";
import { TaggerFile } from "../utils/types";
import File from "./File";
import './FileList.css';

const FileList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const fileQuery = useQuery(["files"], searchForFiles);

  if (fileQuery.isLoading) return <h2>Loading...</h2>
  if (fileQuery.isError) {
    const errorMessage = fileQuery.error instanceof Error ? fileQuery.error.message : "An error occurred.";
    return <h2>{errorMessage}</h2>
  }

  const setPage = async (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) params.set("page", page.toString());
    else params.delete("page");
    setSearchParams(params);
    await fileQuery.refetch();
  }

  return (
    <div className="file-list">
      <ul>
        {fileQuery.data.files.map((file: TaggerFile) => (
          <li className="center-children" key={file.id}>
            <File file={file}/>
          </li>
        ))}
      </ul>
      <nav className="center-children">
        {page > 1 && <button onClick={()=>setPage(1)}>{"<<"}</button>}
        {page > 1 && <button onClick={()=>setPage(page-1)}>{"<"}</button>}
        {page < fileQuery.data.totalPages && <button onClick={()=>setPage(page+1)}>{">"}</button>}
        {page < fileQuery.data.totalPages && <button onClick={()=>setPage(fileQuery.data.totalPages)}>{">>"}</button>}
      </nav>
      {fileQuery.data.totalPages &&
        <span className="center-children">
            Page {page} of {fileQuery.data.totalPages}
        </span>
      }
    </div>
  );
};

export default FileList;
