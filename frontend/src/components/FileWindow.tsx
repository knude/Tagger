import { useParams } from 'react-router-dom';
import { ChangeEvent, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getFile, addTags, deleteFile } from "../services/files";
import { getObjectURL } from "../services/objects";
import { handleAnchorClick } from "../utils/utils";
import Popup from "../common/Popup"
import './FileWindow.css';

const FileWindow = () => {
  const queryClient = useQueryClient();
  const { id: idParam } = useParams<{ id: string }>();
  const id = Number(idParam);
  const [newTag, setNewTag] = useState("");
  const [active, setActive] = useState(false);

  const handleNewTagChange = (event: ChangeEvent<HTMLInputElement>) => setNewTag(event.target.value);

  const fileQuery = useQuery(
    ["files", id],
    () => getFile(id), {
    enabled: !!id,
  });

  const tagsMutation = useMutation(
    (tags: string[]) => addTags(id, tags), {
    onSuccess: async (data) => {
      queryClient.setQueryData(["files", id], data);
      await fileQuery.refetch();
    }
  });

  const deleteFileMutation = useMutation(
    () => deleteFile(id), {
    onSuccess: async () => {
      await queryClient.refetchQueries(["files"],{ exact: true });
      window.history.back();
    }
  });

  const submitNewTag = () => {
    if (newTag) tagsMutation.mutate([newTag]);
    setNewTag("");
  };

  if (fileQuery.isLoading || !fileQuery) return <h2>Loading...</h2>
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

  const deleteFilePopup = (
    <Popup active={active} setActive={setActive} isLoading={deleteFileMutation.isLoading} isError={deleteFileMutation.isError}>
      <div>
        <h2>Are you sure you want to delete this file?</h2>
        <button onClick={() => setActive(false)}>Cancel</button>
        <button onClick={() => deleteFileMutation.mutate()}>Delete</button>
      </div>
    </Popup>
  );

  return (
    <div className="file-window">
      {deleteFilePopup}
      <div className="side-bar">
        <button onClick={() => window.history.back()}>Back</button>
        <button onClick={() => setActive(true)}>Delete</button>
        <h2>Tags</h2>
        <ul>
          {fileQuery.data.tags?.map((tag) => (
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
      <div className="file-window-content center-children">
        {renderFile()}
      </div>
    </div>
  );
};

export default FileWindow;