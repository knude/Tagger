import { FC, useState } from "react";
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { handleAnchorClick } from "../utils/utils";
import Popup from "../common/Popup"
import './Header.css';

const Header: FC = () => {
  const [active, setActive] = useState(false);
  const { loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0();

  return (
    <div className="header">
      {active && <Popup active={active} setActive={setActive} isLoading={isLoading}>
        <h2>Are you sure you want to log out?</h2>
        <div className="right">
          <button onClick={() => setActive(false)}>No</button>
          <button onClick={() => logout()}>Yes</button>
        </div>
      </Popup>}
      <nav>
        <Link to="/" onClick={handleAnchorClick}>
          Home
        </Link>
        <Link to="/search" onClick={handleAnchorClick}>
          Search
        </Link>
        <Link to="/upload" onClick={handleAnchorClick}>
          Upload
        </Link>
        {isAuthenticated && !isLoading && (
          <>
            <Link to="/user" onClick={handleAnchorClick}>
              Profile
            </Link>
            <button onClick={() => setActive(true)}>
              Logout
            </button>
          </>
          )
        }
        {!isAuthenticated && !isLoading && (
            <button onClick={() => loginWithRedirect()}>
              Login
            </button>
          )
        }
      </nav>
    </div>
  );
};

export default Header;