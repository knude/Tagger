import React, {useRef} from "react";


const FileUploader = () => {
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFile = () => {
    const file = fileRef.current?.files?.[0];
    console.log(file)
    // const splitName = file?.name.split(".");
    // const taggerFile: TaggerFile = {
    //   id: files.length + 1,
    //   name: splitName ? splitName[0] : "",
    //   extension: splitName ? splitName[1] : "",
    // };

    // if (file) {
    //   dispatch(addFile(taggerFile));
    // }
  };

  return (
    <div>
      <h1>Upload Files</h1>
      <input type="file" ref={fileRef} />
      <button onClick={uploadFile}>Upload</button>
    </div>
  );
};

export default FileUploader;
