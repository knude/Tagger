import FileList from "./FileList";
import SearchBar from "./SearchBar";

const Search = () => {

  return(
    <div className="main-window">
      <div className="side-bar">
        <h1>Search</h1>
        <SearchBar />
      </div>
      <FileList />
    </div>
  )
}

export default Search;