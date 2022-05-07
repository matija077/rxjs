import React, { useEffect } from "react";
import logo from "./logo.svg";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import { Fetch } from "./components/fetch/Fetch";
import { Pokemons } from "./components/pokemons/Pokemon";
import Test from "./components/test";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div className="Header">
          <NavLink to="/fetch">Fetch</NavLink>
          <NavLink to="/pokemons">Pokemons</NavLink>
        </div>
        <Routes>
          <Route path="/fetch" element={<Fetch />}></Route>
          <Route path="/pokemons" element={<Pokemons />}></Route>
          <Route path="/test" element={<Test />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
