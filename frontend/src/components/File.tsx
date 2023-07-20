import "./File.css";
import { TaggerFile } from "../types";
import { getThumbnailURL } from "../services/objects";

const File = ({ file }: { file: TaggerFile }) => {
  return (
    <a className="file" href={`/file/${file.id}`}>
      <img src={getThumbnailURL(file)} alt="file" />
    </a>
  );
};

export default File;