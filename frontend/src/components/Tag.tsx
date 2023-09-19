import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { TaggerTag } from "../utils/types";

interface TagProps {
  tag: TaggerTag;
}

const Tag = ({ tag }: TagProps) => {
  const queryClient = useQueryClient();

  const handleTagClick = async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    await queryClient.invalidateQueries(["files"], { exact: true });
  };

  return (
    <>
      <Link to={`/search?q=${tag.name}`} onClick={handleTagClick}>
        {tag.name}
      </Link>
    </>
  );
}

export default Tag;
