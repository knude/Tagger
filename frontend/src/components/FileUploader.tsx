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
    <div>
      <h1>Upload Files</h1>
      {isAuthenticated && (
        <>
          <input type="file" ref={fileRef} />
          <button onClick={submit}>Upload</button>
          <UserFiles />
        </>
      ) || <h2>Log in to upload files</h2>
      }
    </div>
  );
};

export default FileUploader;
