import { useParams } from 'react-router-dom';
import { ChangeEvent, useEffect, useState } from "react";
import { getFile, addTags } from "../services/files";
import { TaggerFileWithTags } from "../types";
import './FileWindow.css';
import {getObjectURL} from "../services/objects";

const FileWindow = () => {
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<TaggerFileWithTags | null>(null);
  const [newTag, setNewTag] = useState("");

  const handleNewTagChange = (event: ChangeEvent<HTMLInputElement>) => setNewTag(event.target.value);

  const submitNewTag = () => {
    if(!file || !newTag) return;

    addTags(file.id, [newTag]).then((file) => {
      setFile(file);
      setNewTag("");
    });
  }

  useEffect(() => {
    if(!id) return;
    getFile(Number(id)).then((file) => {
      setFile(file);
    });
  }, [id]);

  const renderFile = () => {
    if(!file) return null;
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
        <h2>{file.name}</h2>
      </>
    );
  }

  return (
    <div className="file-window">
      <div className="side-bar">
        <h2>Tags</h2>
        <ul>
          {file?.tags.map((tag) => (
            <li key={tag.id}>
              <a href={`/search?q=${tag.name}`}>
                {tag.name}
              </a>
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