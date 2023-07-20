import { useParams } from 'react-router-dom';
import { ChangeEvent, useEffect, useState } from "react";
import { getFile, addTags } from "../services/file";
import { TaggerFileWithTags } from "../types";
import './FileWindow.css';

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
        {file && (
          <div>
            <img src="https://i.imgur.com/bNSZLac.png" alt="file" />
            <h2>{file.name}</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileWindow;