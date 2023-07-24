import { TaggerFile } from "../utils/types";
import { Link } from "react-router-dom";
import { getThumbnailURL } from "../services/objects";
import { handleAnchorClick } from "../utils/utils";
import "./File.css";

const File = ({ file }: { file: TaggerFile }) => {
  return (
    <Link to={`/file/${file.id}`} className="file center-children" onClick={handleAnchorClick}>
      <img src={getThumbnailURL(file)} alt="file" />
    </Link>
  );
};

export default File;