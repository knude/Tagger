import { useParams } from 'react-router-dom';
import { ChangeEvent, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFile, addTags, deleteTag, deleteFile } from "../services/files";
import { getObjectURL } from "../services/objects";
import { isOwner } from "../services/auth";
import { getToken } from "../utils/utils";
import Popup from "../common/Popup"
import Tag from "./Tag";
import './FileWindow.css';

const FileWindow = ()  => {
  const queryClient = useQueryClient();
  const { id: idParam } = useParams<{ id: string }>();
  const id = Number(idParam);
  const [newTag, setNewTag] = useState("");
  const [active, setActive] = useState(false);

  const handleNewTagChange = (event: ChangeEvent<HTMLInputElement>) => setNewTag(event.target.value);

  const authQuery = useQuery(
    ["auth",id],
    () => isOwner(id), {
      enabled: !!id && !!getToken(),
    });

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

  const deleteTagMutation = useMutation(
    (tagId: number) => deleteTag(id, tagId), {
      onSuccess: async () => {
        await fileQuery.refetch();
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
      <img src={objectUrl} alt="file" />
    );
  }

  const deleteFilePopup = (
    <Popup active={active} setActive={setActive} isLoading={deleteFileMutation.isLoading} isError={deleteFileMutation.isError}>
      <>
        <h2>Are you sure you want to delete this file?</h2>
        <div className="right">
          <button onClick={() => setActive(false)}>Cancel</button>
          <button onClick={() => deleteFileMutation.mutate()}>Delete</button>
        </div>
      </>
    </Popup>
  );

  const renderTags = () => {
    return (
      <ul>
        {fileQuery.data.tags?.map((tag) => (
          <li key={tag.id}>
            {authQuery.data && <button onClick={() => deleteTagMutation.mutate(tag.id)}>x</button>} <Tag tag={tag} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="file-window main-window">
      {deleteFilePopup}
      <div className="side-bar">
        <button onClick={() => window.history.back()}>Back</button>
        <h2>Tags</h2>
        {renderTags()}
        {authQuery.data && (
          <>
            <form onSubmit={(e) => {e.preventDefault(); submitNewTag()}}>
              <input type="text" value={newTag} onChange={handleNewTagChange} />
              <button type="submit">Add Tag</button>
            </form>
            <h2>File Actions</h2>
            <button onClick={() => setActive(true)}>Delete</button>
          </>
        )}
      </div>
      <div className="file-window-content main-window-content">
        {renderFile()}
      </div>
    </div>
  );
};

export default FileWindow;