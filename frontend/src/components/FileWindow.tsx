import { useParams } from 'react-router-dom';
import { ChangeEvent, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getFile, addTags } from "../services/files";
import { getObjectURL } from "../services/objects";
import { handleAnchorClick } from "../utils/utils";
import './FileWindow.css';

const FileWindow = () => {
  const { id } = useParams<{ id: string }>();
  const [newTag, setNewTag] = useState("");

  const handleNewTagChange = (event: ChangeEvent<HTMLInputElement>) => setNewTag(event.target.value);

  const fileQuery = useQuery(["file", id], () => getFile(Number(id)), {
    enabled: !!id,
  });

  const tagsMutation = useMutation((tags: string[]) => addTags(Number(id), tags), {
    onSuccess: async () => {
      await fileQuery.refetch();
    }
  });

  const submitNewTag = () => {
    if (newTag) tagsMutation.mutate([newTag]);
    setNewTag("");
  };

  if (fileQuery.isLoading) return <h2>Loading...</h2>
  if (fileQuery.isError) {
    const errorMessage = fileQuery.error instanceof Error ? fileQuery.error.message : "An error occurred.";
    return <h2>{errorMessage}</h2>
  }

  const renderFile = () => {
    const file = fileQuery.data;
    const objectUrl = getObjectURL(file);
    if (file.extension === "mp4" || file.extension === "webm"){
      return (
        <video controls>
          <source src={objectUrl} type={`video/${file.extension}`} />
        </video>
      );
    }
    return (
      <>
        <img src={objectUrl} alt="file" />
      </>
    );
  }

  return (
    <div className="file-window">
      <div className="side-bar">
        <h2>Tags</h2>
        <ul>
          {fileQuery.data.tags.map((tag) => (
            <li key={tag.id}>
              <Link to={`/search?q=${tag.name}`} onClick={handleAnchorClick}>
                {tag.name}
              </Link>
            </li>
          ))}
        </ul>
        <input type="text" onChange={handleNewTagChange} />
        <button onClick={submitNewTag}>Add Tag</button>
      </div>
      <div className="file-window-content">
        {renderFile()}
      </div>
    </div>
  );
};

export default FileWindow;