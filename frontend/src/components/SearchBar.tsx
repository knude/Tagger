import {useQueryClient} from "@tanstack/react-query";
import {ChangeEvent, useState} from "react";
import { useSearchParams, useNavigate } from "react-router-dom";


const SearchBar = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams()
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
    <div>
      <input type="text" onChange={handleChange}/>
      <button onClick={search}>Search</button>
    </div>
  )
}

export default SearchBar;