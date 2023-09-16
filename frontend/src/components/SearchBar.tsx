import { useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./SearchBar.css"


const SearchBar = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate();

  useEffect(() => {
    if (!query && searchParams.get("q")) {
      setQuery(searchParams.get("q") ?? "");
    }
  }, [searchParams.get("q")]);

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
    <div>
      <form onSubmit={(e) => {e.preventDefault(); search()}}>
        <input type="text" value={query ?? searchParams.get("q")} onChange={handleChange} />
        <button type="submit">Search</button>
      </form>
    </div>
  )
}

export default SearchBar;