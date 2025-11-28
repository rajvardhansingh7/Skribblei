import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import HomeScreen from "./views/HomeScreen";
import PlayScreen from "./views/PlayScreen";
import { useEffect } from "react";


function App() {
  useEffect(() => {
    const url = `${process.env.PUBLIC_URL}/background.png`;
    document.body.style.backgroundImage = `url('${url}')`;
    return () => {
      document.body.style.backgroundImage = "";
    };
  }, []);
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={<HomeScreen />}
        ></Route>
        <Route
          path="/play"
          element={<PlayScreen />}
        ></Route>
      </Routes>
    </div>
  );
}

export default App;
