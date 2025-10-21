import { useEffect, useState } from "react";
import StarRating from "./components/StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

// API KEY
const KEY = "a81ca967";

//Structural Component
export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);

  //Loader for loading
  const [isLoading, setIsLoading] = useState(false);

  //Set Error Message
  const [error, setError] = useState("");

  //Selection of the left side movies to the right side feature
  const [selectedId, setSelectedId] = useState(null);
  /*
  //Just Test useEffect 
  useEffect(function () {
    // console.log("After initial render");
  }, []);
  useEffect(function () {
    // console.log("After every renders");
  });

  useEffect(
    function () {
      // console.log("D");
    },
    [query]
  );
  // console.log("During render");
*/

  //HANDEL FUNCTION ⚙️

  function handelSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }

  //Movie Add logic
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  // Movie Delete logic
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  // Check useEffect Add the API (As a side effect)
  useEffect(
    function () {
      //This method use for prevent the race condition when ever search a movie letter into the search box concurrently word search the api hits and browser makes slow and search hit the anomaly out comes!

      //This is a browser API (Native API)
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          //Set loading
          setIsLoading(true);

          // Set reset the error message
          setError("");
          //API Check
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          const data = await res.json();

          if (!res.ok) throw new Error("Something went with fetching movies!");

          if (data.Response === "False")
            throw new Error("Oops! Movie Not Found!");

          setMovies(data.Search);
          // console.log(data.Search);
          setError("");
        } catch (err) {
          // console.error(err.message);

          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      //Close every search before the movie details page
      handleCloseMovie();

      fetchMovies();

      //** This is a clean up function to call the prevent method to use ! controller abort function
      return function () {
        controller.abort();
      };
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
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handelSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
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

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

//Stateless or presentational Component
function Movie({ movie, onSelectMovie, onCloseMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
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

//Selected Movie Component
function MovieDetails({ selectId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectId);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectId
  )?.userRating;

  // Set to capital to small name conversion
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  // Keypress handler where close the movie details by "Escape"
  useEffect(
    function () {
      // For reuseable function to use this callback function!
      function callBack(e) {
        if (e.code === "Escape") {
          onCloseMovie();
          // console.log("CLOSING!");
        }
      }

      // Basic document DOM event
      document.addEventListener("keydown", callBack);

      //Clean up function
      return function () {
        document.removeEventListener("keydown", callBack);
      };
    },

    [onCloseMovie] //depency
  );

  useEffect(
    function () {
      //Loading Movie Details
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${selectId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectId] // The dependecy array selected when click any movie selectedid then it on screen
  );

  //The index.html title change side effect
  useEffect(
    function () {
      //Fixing issue when first click to show the undefined in the begining!
      if (!title) return;

      document.title = `Movie | ${title}`;

      //Clean up function
      return function () {
        document.title = "RateIt";

        //A importan concept here to see
        // console.log(`Clean up effect for movie ${title}`);

        // **It represent the javascript concept closure concept where that after function completly exection but still remember the previous one value!
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                lineHeight: "1",
                textAlign: "justify",
                padding: "3px",
                fontSize: "2.6rem",
                fontWeight: "900",
                height: "42px",
                width: "42px",
                backgroundColor: "#5c7991ab",
                color: "#fff",
              }}
              className="btn-back"
              onClick={onCloseMovie}
            >
              <strong> &larr;</strong>
            </button>

            <img src={poster} alt={`Poster of the ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB Rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to the list
                    </button>
                  )}
                </>
              ) : (
                <p style={{ textAlign: "center" }}>
                  &bull; You rated with this movie {watchedUserRating}{" "}
                  <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>"{plot}"</em>
            </p>
            <p>&bull; Starring {actors}</p>
            <p>&bull; Directed By the {director}</p>
          </section>
        </>
      )}
      {/* {selectId} for check */}
    </div>
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
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovies
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovies({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.Title} poster`} />
      <h3>{movie.title}</h3>
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

        <button
          style={{
            width: "25px",
            margin: "12px",
            height: "25px",
            fontFamily: "700",
            fontSize: "16px",
            color: "white",
          }}
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
