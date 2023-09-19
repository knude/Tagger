import { TaggerFile } from "../utils/types";
import { Link } from "react-router-dom";
import { getThumbnailURL } from "../services/objects";
import "./File.css";

const File = ({ file }: { file: TaggerFile }) => {
  const label: string = file.extension.toUpperCase();
  return (
    <Link to={`/file/${file.id}`} className="file center-children">
      <img src={getThumbnailURL(file)} alt={`${label} file`} />
      <span>{label}</span>
    </Link>
  );
};

export default File;