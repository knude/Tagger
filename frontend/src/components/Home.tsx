import FileList from "./FileList";
import { TaggerFile } from "../types";
import { useEffect, useState } from "react";
import { getFiles } from "../services/file";

const Home = () => {
  const [files, setFiles] = useState<TaggerFile[]>([]);

  useEffect(() => {
    getFiles().then((files) => setFiles(files));
  }, []);

  return (
    <div className="home">
      <h1>Browse</h1>
      <FileList files={files}/>
    </div>
  );
};

export default Home;