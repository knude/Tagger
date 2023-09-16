import { Link } from "react-router-dom";
import { TaggerTag } from "../utils/types";
import { handleAnchorClick } from "../utils/utils";

const Tag = ({ tag }: { tag: TaggerTag }) => {
  return (
    <Link to={`/search?q=${tag.name}`} onClick={handleAnchorClick}>
      {tag.name}
    </Link>
  )
}

export default Tag;