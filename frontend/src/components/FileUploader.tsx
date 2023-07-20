import { useRef, useState } from "react";
import { uploadFile } from "../services/files";
import { TaggerFile } from "../types";
import File from "./File";


const FileUploader = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<TaggerFile | null>(null);

  const submit = async () => {
    const file = fileRef.current?.files?.[0];
    if (file) {
      const result = await uploadFile(file)
      fileRef.current.value = "";
      setFile(result);
    }
  };

  return (
    <div>
      <h1>Upload Files</h1>
      <input type="file" ref={fileRef} />
      <button onClick={submit}>Upload</button>
      {file && <File file={file} />}
    </div>
  );
};

export default FileUploader;
