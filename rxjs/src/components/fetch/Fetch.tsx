import React, { useEffect, useState } from "react";
import { URLS } from "../../services/consts";
import { IError } from "../pokemons/Pokemon";
import "./Fetch.css";

interface IAnimal {
  name: string;
}

export const Fetch = () => {
  const [users, setUsers] = useState<any>(null);

  const [animal, setAnimal] = useState<IAnimal | null>(null);

  const [corona, setCorona] = useState<any>(null);

  const [error, setError] = useState<IError | null>(null);

  return (
    <div className="Fetch">
      <h1>FETCH PAGE</h1>

      <div className="Animal">
        <h2>Search animals</h2>
        <input type="text" name="animal" placeholder="Pig" />
        <div className="Animal--Animal">
          <ul>
            <li>{animal?.name}</li>
          </ul>
        </div>
      </div>

      <div className="Users">
        <h2>Search Users</h2>
        <input type="text" name="users" placeholder="User1" />
      </div>
    </div>
  );
};
