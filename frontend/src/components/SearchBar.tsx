import { useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const SearchBar = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const setSearchParams = useSearchParams()[1];
  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value);

  const search = async () => {
    if (query && !window.location.href.includes("/search")) {
      navigate(`/search?q=${query}`);
    } else {
      if (query) setSearchParams({q: query})
      else setSearchParams({})
    }
    await queryClient.invalidateQueries(["files"]);
  }

  return (
    <form>
      <input type="text" onChange={handleChange}/>
      <button onClick={search}>Search</button>
    </form>
  )
}

export default SearchBar;