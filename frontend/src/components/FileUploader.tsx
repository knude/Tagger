import { useRef } from "react";
import { uploadFile } from "../services/file";


const FileUploader = () => {
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    const file = fileRef.current?.files?.[0];
    if (file) {
      const result = await uploadFile(file)
      console.log(result)
      fileRef.current.value = "";
    }
  };

  return (
    <div>
      <h1>Upload Files</h1>
      <input type="file" ref={fileRef} />
      <button onClick={submit}>Upload</button>
    </div>
  );
};

export default FileUploader;
