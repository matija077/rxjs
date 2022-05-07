import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BehaviorSubject,
  map,
  mapTo,
  Observable,
  pipe,
  startWith,
  from,
  of,
  skipWhile,
  Subject,
  tap,
  filter,
} from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { URLS } from "../../services/consts";
import {
  fetch$,
  loading$,
  onInitialFetch,
  onInput$,
} from "../../services/FetchService";
import "./Pokemon.css";

export interface IError {
  error: string;
}

interface IPokemon {
  name: string;
  data?: any;
}

export const Pokemons = () => {
  const [pokemons, setPokemons] = useState<IPokemon[] | null>(null);
  const [fitleredPokemons, setFilteredPokemons] =
    useState<IPokemon[] | null | undefined>(null);
  const [pokemonInput, setPokemonInput] = useState("");
  const [showAllPokemons, setShowAllPokemons] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forceRender, setForceRender] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // TODO refactor this to be better. loading and errors should be out
  const fetchForPokemons = useCallback(
    loading$({
      keepLoadingFor: 200,
      showLoadingAfter: 200,
      setIsError: (e) => console.log(e),
      setIsLoading: (l) => setIsLoading(l),
    }),
    []
  );
  const fetchForPokemon = useCallback(
    loading$({
      keepLoadingFor: 200,
      showLoadingAfter: 0,
      setIsError: (e) => console.log(e),
      setIsLoading: (l) => setIsLoading(l),
    }),
    []
  );

  const fetchPokemons = useCallback(
    () => fetchForPokemons(URLS.pokemons),
    [fetchForPokemons]
  );

  const fetchPokemonOnInput = useMemo(
    () =>
      onInput$({
        baseUrl: "https://pokeapi.co/api/v2/pokemon/",
        debounceTimeValue: 300,
        fetchFunc: fetchForPokemon,
      }),
    []
  );

  const fetchOrNotPokemon = useMemo(() => {
    const t = new Subject<IPokemon>();
    const t2: Observable<any> = t.pipe(
      filter((p) => !p.data),
      // ovo treba zaminit ne znam ni kako radi uopce
      tap((p) => fetchPokemonOnInput.next(p.name))
    );
    return { subj: t, obs: t2 };
  }, []);

  // https://pokeapi.co/api/v2/pokemon/{id or name}/

  const fetchPokemons2 = () =>
    onInitialFetch(
      {
        pokemons: {
          url: URLS.pokemons,
          setState: (data: any) => {
            const pokemons = data.results.map(
              (pokemon: Record<string, any>) => ({
                name: pokemon.name,
              })
            );
            setFilteredPokemons(pokemons);
            setPokemons(pokemons);
            setIsLoading(false);
          },
        },
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

  useEffect(() => {
    const pokemons = fetchPokemons();

    pokemons.subscribe({
      next: (data) => {
        console.log(data);
        const pokemons = (data as any).results.map(
          (pokemon: Record<string, any>) => ({
            name: pokemon.name,
          })
        );
        setFilteredPokemons(pokemons);
        setPokemons(pokemons);
      },
    });
  }, []);

  useEffect(() => {
    const filteredPokemons = pokemons?.filter((pokemon) =>
      pokemon.name.includes(pokemonInput)
    );

    setFilteredPokemons(filteredPokemons);
  }, [pokemonInput]);

  useEffect(() => {
    if (
      !fitleredPokemons ||
      fitleredPokemons?.length > 5 ||
      fitleredPokemons?.length === 0
    ) {
      return;
    }

    // TODO  wrong susbcription
    const subFetchOrNotPokemon = fetchOrNotPokemon.obs.subscribe(
      (newPokemon: any) => {
        if (!pokemons) {
          return;
        }
        const pokemonIndex = pokemons.findIndex(
          (prevPokemon) => prevPokemon.name === (newPokemon as IPokemon).name
        );
        const filteredPokemonIndex = pokemons.findIndex(
          (prevPokemon) => prevPokemon.name === (newPokemon as IPokemon).name
        );

        //console.log(pokemonIndex);
        //console.log(filteredPokemonIndex);
        //console.log(newPokemon.name);

        if (!~pokemonIndex) {
          return console.error("wromng");
        }

        pokemons[pokemonIndex].data = newPokemon;

        if (!~filteredPokemonIndex) {
          return;
        }
        setForceRender((prevState) => !prevState);
      }
    );

    fitleredPokemons.forEach((pokemon) => {
      fetchOrNotPokemon.subj.next(pokemon);
    });

    return () => subFetchOrNotPokemon.unsubscribe();

    //return sub.unsubscribe;
  }, [fitleredPokemons]);

  const onInputHandler = (event: FormEvent<HTMLInputElement>) => {
    const userInput = event.currentTarget.value;
    setPokemonInput(userInput);
  };
  const toggleShowAllPokemonsHandler = (_: React.MouseEvent) =>
    setShowAllPokemons((prevState) => !prevState);
  const onFetchAgainHandler = (_: React.MouseEvent) => {
    setError(null);
    fetchPokemons2();
  };

  const onFavoriteClickHandler = () =>
    (fetch as any)({
      url: "localhost:8000",
      body: JSON.stringify("tu sam"),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((r: any) => console.log(r));

  const pokemonsToShow = showAllPokemons
    ? fitleredPokemons
    : fitleredPokemons?.slice(0, 20);

  return (
    <div className="Fetch">
      <h1>FETCH PAGE</h1>

      <div className="Pokemon">
        <button
          className="ShowAllPokemons"
          onClick={toggleShowAllPokemonsHandler}
        >
          {showAllPokemons ? "HIDE" : "SHOW ALL"}
        </button>
        <h2>Search pokemons</h2>
        <input
          type="text"
          name="pokemon"
          placeholder="Search pokemons"
          onInput={onInputHandler}
        />
        <div className="Pokemon--Pokemon">
          {isLoading ? (
            <h2>LOADING ...</h2>
          ) : (
            <ul>
              {pokemonsToShow?.map((pokemon: IPokemon) => (
                <div key={pokemon.name}>
                  <li>{pokemon?.name}</li>
                  {pokemon.data ? (
                    <span>{pokemon.data.name}</span>
                  ) : (
                    <span>Loading additionsl data </span>
                  )}
                  <button onClick={onFavoriteClickHandler}>Favorite</button>
                </div>
              ))}
            </ul>
          )}
          {error && (
            <>
              <h1>ERROR FETCHING!</h1>
              <button onClick={onFetchAgainHandler}>Fetch again</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
