import "./File.css"

const File = ({ name, id }: { name: string, id: number }) => {
  return (
    <a className="file" href={`/file/${id}`}>
      <img src="https://i.imgur.com/bNSZLac.png" alt="file" />
      <h2>{name}</h2>
    </a>
  );
};

export default File;