import { FC } from "react";
import { Link } from 'react-router-dom';
import { handleAnchorClick } from "../utils/utils";
import './Header.css';

const Header: FC = () => {

  return (
    <div className="header">
      <nav>
        <Link to="/" onClick={handleAnchorClick}>
          Home
        </Link>
        <Link to="/search" onClick={handleAnchorClick}>
          Search
        </Link>
        <Link to="/login" onClick={handleAnchorClick}>
          Login
        </Link>
        <Link to="/upload" onClick={handleAnchorClick}>
          Upload
        </Link>
      </nav>
    </div>
  );
};

export default Header;