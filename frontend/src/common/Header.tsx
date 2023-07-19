import { FC, MouseEvent } from "react";
import { Link } from 'react-router-dom';
import './Header.css';

const Header: FC = () => {
  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button === 0) {
      event.currentTarget.removeAttribute('target');
    } else {
      event.currentTarget.setAttribute('target', '_blank');
    }
  };

  return (
    <div className="header">
      <nav>
        <Link to="/" onClick={handleLinkClick}>
          Home
        </Link>
        <Link to="/search" onClick={handleLinkClick}>
          Search
        </Link>
        <Link to="/login" onClick={handleLinkClick}>
          Login
        </Link>
        <Link to="/upload" onClick={handleLinkClick}>
          Upload
        </Link>
      </nav>
    </div>
  );
};

export default Header;