import { FC } from "react";
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { setToken } from "../services/files";
import { handleAnchorClick } from "../utils/utils";
import './Header.css';

const Header: FC = () => {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  if (isAuthenticated) {
    getAccessTokenSilently().then((token) => {
      setToken(token);
    });
  }

  return (
    <div className="header">
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
            <button onClick={() => logout()}>
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