import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom";
import { getAllTags } from "../services/files";
import FileList from "./FileList";
import SearchBar from "./SearchBar";
import { TaggerTagWithCount } from "../utils/types";
import Tag from "./Tag";

const Search = () => {
  const tagsQuery = useQuery(
    ["tags"],
    () => getAllTags(), {
      enabled: true,
    }
  );

  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const tags = searchParams.get("q")?.split(" ") || [];

  const handleTagButtonClick = async (tagName: string) => {
    if (!tags.includes(tagName)) {
      setSearchParams({ q: [...tags, tagName].join(" ") });
      await new Promise((resolve) => setTimeout(resolve, 0));
      await queryClient.invalidateQueries(["files"], { exact: true });
    } else {
      const filteredTags = tags.filter((tag) => tag !== tagName);
      if (filteredTags.length === 0) {
        setSearchParams({});
      } else {
        setSearchParams({ q: filteredTags.join(" ") });
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
      await queryClient.invalidateQueries(["files"], { exact: true });
    }
  };

  if (tagsQuery.isLoading || !tagsQuery) return <h2>Loading...</h2>
  if (tagsQuery.isError) {
    const errorMessage = tagsQuery.error instanceof Error ? tagsQuery.error.message : "An error occurred.";
    return <h2>{errorMessage}</h2>
  }

  const renderTags = () => {
    return (
      <ul>
        {tagsQuery.data.tags.map((tag: TaggerTagWithCount) => (
          <li key={tag.id}>
            <button onClick={() => handleTagButtonClick(tag.name)}>
              {
                tags.includes(tag.name) ? "-" : "+"
              }
            </button> {" "}
            <Tag
              tag={tag}
            /> {tag.count}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="main-window">
      <div className="side-bar">
        <h1>Search</h1>
        <SearchBar />
        <h2>Tags</h2>
        {renderTags()}
      </div>
      <FileList />
    </div>
  )
}

export default Search;
