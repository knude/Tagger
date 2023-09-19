import {Link, useNavigate, useSearchParams} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { TaggerTag } from "../utils/types";

const Tag = ({ tag }: { tag: TaggerTag }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleTagClick = async () => {
    navigate(`/search?q=${tag.name}`);

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    await queryClient.invalidateQueries(["files"], { exact: true });
  };

  return (
    <Link to={`/search?q=${tag.name}`} onClick={handleTagClick}>
      {tag.name}
    </Link>
  );
}

export default Tag;