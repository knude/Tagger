import FileList from "./FileList";
import { useState, ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const Search = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value);

  const search = async () => {
    if (query) setSearchParams({q: query})
    else setSearchParams({})
    await queryClient.invalidateQueries(["files"]);
  }

  return(
    <div>
      <h1>Search</h1>
      <input type="text" onChange={handleChange}/>
      <button onClick={search}>Search</button>
      <FileList />
    </div>
  )
}

export default Search;