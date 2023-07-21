import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile } from "../services/files";
import FileList from "./FileList";


const FileUploader = () => {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const newFileMutation = useMutation(uploadFile,  {
    onSuccess: async (data) => {
      queryClient.setQueryData(["files",data.id], data);
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
      <input type="file" ref={fileRef} />
      <button onClick={submit}>Upload</button>
      <FileList />
    </div>
  );
};

export default FileUploader;
