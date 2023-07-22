import "./Popup.css"

interface PopupProps {
  active: boolean;
  setActive: (active: boolean) => void;
  isLoading: boolean;
  isError?: boolean;
  children: any;
}

const Popup = ({ active, setActive, isLoading, isError, children }: PopupProps) => {
  const closeButton = () => {
    return (
      <button onClick={() => setActive(false)}>Close</button>
    );
  }
  return (
    <div className={`popup ${active ? "active" : ""}`}>
      <div className="popup__content">
        {
          isLoading ? (
            <>
              <h2>Loading...</h2>
              {closeButton()}
            </>
          ) : isError ? (
            <>
              <h2>An error occurred.</h2>
              {closeButton()}
            </>
          )
            : children
        }
      </div>
    </div>
  );
};

export default Popup;