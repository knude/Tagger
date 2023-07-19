import "./File.css"

const File = ({ name }: { name: string }) => {
  return (
    <div className="file">
      <img src="https://i.imgur.com/bNSZLac.png" alt="file" />
      <h2>{name}</h2>
    </div>
  );
};

export default File;