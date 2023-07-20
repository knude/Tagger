import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUploader from "./components/FileUploader";
import FileWindow from "./components/FileWindow";
import Header from './common/Header';
import Home from "./components/Home";
import Search from "./components/Search";
import "./App.css";

function App() {
  return (
    <>
      <Router>
        <Header />
        <div className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<h1>Login</h1>} />
            <Route path="/upload" element={<FileUploader/>} />
            <Route path="/file/:id" element={<FileWindow />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
