import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import FileUploader from "./components/FileUploader";
import FileWindow from "./components/FileWindow";
import Header from './common/Header';
import Home from "./components/Home";
import Search from "./components/Search";
import User from "./common/User";
import "./App.css";
import { setToken } from "./utils/utils";
import {useEffect, useState} from "react";

function App() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [tokenChanged, setTokenChanged] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently().then((token) => {
        setToken(token);
        setTokenChanged(true);
      })
    }
  }, [isAuthenticated]);

  return (
    <>
      <Router>
        <Header />
        <div className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<h1>Login</h1>} />
            <Route path="/upload" element={<FileUploader />} />
            <Route path="/file/:id" element={<FileWindow />} />
            <Route path="/user" element={<User />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
