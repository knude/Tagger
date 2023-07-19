interface PopupProps {
  active: boolean;
  children: any;
}

const Popup = ({ active, children }: PopupProps) => {
  return (
    <div className={`popup ${active ? "active" : ""}`}>
      <div className="popup__content">{children}</div>
    </div>
  );
};

export default Popup;