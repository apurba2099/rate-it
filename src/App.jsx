import { useEffect, useState } from "react";
import { tempMovieData, tempWatchedData } from "./Data/data";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

// API KEY
const KEY = "a81ca967";

//Structural Component
export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [query, setQuery] = useState("");

  //Loader for loading
  const [isLoading, setIsLoading] = useState(false);

  //Set Error Message
  const [error, setError] = useState("");

  //Set as a default query to view in the UI
  // const tempQuery = "Titanic";

  /*
  //Just Test useEffect 
  useEffect(function () {
    console.log("After initial render");
  }, []);
  useEffect(function () {
    console.log("After every renders");
  });

  useEffect(
    function () {
      console.log("D");
    },
    [query]
  );
  console.log("During render");
*/

  // Check useEffect Add the API (As a side effect)
  useEffect(
    function () {
      async function fetchMovies() {
        try {
          //Set loading
          setIsLoading(true);

          // Set reset the error message
          setError("");
          //API Check
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
          );
          const data = await res.json();

          if (!res.ok) throw new Error("Something went with fetching movies!");

          if (data.Response === "False")
            throw new Error("Oops! Movie Not Found!");

          setMovies(data.Search);
        } catch (err) {
          console.error(err.message);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      fetchMovies();
    },
    [query] //dependency array
  );
  return (
    <>
      {/* NAVBAR COMPONENT  */}
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>

      {/* MAIN COMPONENT  */}
      <Main>
        {/* Explicit Props- Just for learning
        <Box element={<MovieList movies={movies} />} />

        <Box
          element={
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} />
            </>
          }
        /> */}

        {/* BEST FOR NOW AND MORE PREFERRED WAY */}
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} />}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </Box>
      </Main>
    </>
  );
}

//Loader
function Loader() {
  return <span className="loader"></span>;
}

//Error message component
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⚠️</span>
      <strong>{message}</strong>
    </p>
  );
}
//Structural Component
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

//Statless Componet
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>RateIt✨</h1>
    </div>
  );
}

function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
//Stateful Component
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="🔍Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Main({ children }) {
  return (
    <>
      <main className="main">{children}</main>
    </>
  );
}

// MAIN BOX SECTION-1 (Newly Make the Composition reuseable box)
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

// // MAIN BOX SECTION-2
// function Watchedbox() {
//   const [isOpen2, setIsOpen2] = useState(true);
//   const [watched, setWatched] = useState(tempWatchedData);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>

//       {isOpen2 && (
//         <>
//           {/* PROPS DRILLING  */}
//           <WatchedSummary watched={watched} />
//           <WatchedMoviesList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }

function MovieList({ movies }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

//Stateless or presentational Component
function Movie({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>&#128467;</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovies movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

function WatchedMovies({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
