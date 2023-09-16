import { useQuery } from "@tanstack/react-query"
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

  if (tagsQuery.isLoading || !tagsQuery) return <h2>Loading...</h2>
  if (tagsQuery.isError) {
    const errorMessage = tagsQuery.error instanceof Error ? tagsQuery.error.message : "An error occurred.";
    return <h2>{errorMessage}</h2>
  }

  return (
    <div className="main-window">
      <div className="side-bar">
        <h1>Search</h1>
        <SearchBar />
        <h2>Tags</h2>
        <ul>
          {tagsQuery.data.tags.map((tag: TaggerTagWithCount) => (
            <li key={tag.id}>
              <Tag tag={tag} /> {tag.count}
            </li>
          ))}
        </ul>
      </div>
      <FileList />
    </div>
  )
}

export default Search;