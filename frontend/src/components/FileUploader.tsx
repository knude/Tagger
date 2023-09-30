import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile } from "../services/files";
import { useAuth0 } from "@auth0/auth0-react";
import UserFiles from "./UserFiles";


const FileUploader = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth0();
  const fileRef = useRef<HTMLInputElement>(null);

  const newFileMutation = useMutation(uploadFile,  {
    onSuccess: async (data) => {
      queryClient.setQueryData(["files",data.id], data);
      await queryClient.invalidateQueries(["files","user"], { exact: true });
      await queryClient.invalidateQueries(["files"], { exact: true });
    }
  })

  const submit = async () => {
    const file = fileRef.current?.files?.[0];
    if (file) {
      newFileMutation.mutate(file);
      fileRef.current.value = "";
    }
  };

  return (
    <div className="main-window">
      {isAuthenticated && (
        <>
          <div className="side-bar">
            <h1>Upload Files</h1>
            <form>
              <input type="file" ref={fileRef} />
              <button type="button" onClick={submit}>Upload</button>
            </form>
            {newFileMutation.isLoading && <h2>Uploading...</h2>}
            {newFileMutation.isError && <h2>An error occurred.</h2>}
          </div>
          <UserFiles/>
        </>
        ) || <h2>Log in to upload files</h2>
      }
    </div>
  );
};

export default FileUploader;
