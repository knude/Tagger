import FileList from "./FileList";
import { useState, ChangeEvent, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getFiles, searchByTags } from "../services/files";
import { TaggerFile } from "../types";

const Search = () => {
  const [files, setFiles] = useState<TaggerFile[]>([]);
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value);

  const search = async () => {
    if (query) setSearchParams({q: query})
    else setSearchParams({});
  }

  useEffect(() => {
    const query = searchParams.get("q");
    if(!query) {
      getFiles().then((files) => setFiles(files));
      return;
    }
    searchByTags(query).then((files) => setFiles(files));
  }, [searchParams]);

  return(
    <div>
      <h1>Search</h1>
      <input type="text" onChange={handleChange}/>
      <button onClick={search}>Search</button>
      <FileList files={files}/>
    </div>

  )
}

export default Search;