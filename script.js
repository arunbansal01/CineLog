// ==========================================================
// script.js  -  BEHAVIOUR of the CineLog website (JavaScript)
// ----------------------------------------------------------
// The file is divided in numbered parts:
//   1. Variables and constants
//   2. Small helper functions
//   3. Local Storage (save / load)
//   4. Login, register, logout (user and admin roles)
//   5. Sections (navigation)
//   6. Showing movie cards
//   7. Dashboard
//   8. Search, filter and sort
//   9. Movie details pop-up
//  10. Watchlist
//  11. Diary form (with validation) and diary table
//  12. Admin: add / delete movies, users, reports
//  13. Profile, theme, feedback form
//  14. Start of the program (events)
// ==========================================================


// ==========================================================
// 1. VARIABLES AND CONSTANTS
// ==========================================================

// "const" = value never changes.  "let" = value can change.
const sectionNames = ["dashboard", "movies", "watchlist", "diary", "users", "reports", "profile", "about"];

// ARRAYS of strings used for the filters and forms
const genres = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"];
const languages = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Japanese", "Korean", "French", "Spanish", "Italian"];

// OBJECT: each page name (key) has a title (value)
const sectionTitles = {
  dashboard: "Dashboard",
  movies: "Movies",
  watchlist: "My Watchlist",
  diary: "My Diary",
  users: "User Management",
  reports: "Reports",
  profile: "My Profile",
  about: "About"
};

// OBJECT: each genre has two colours (an array) for the poster
const genreColors = {
  "Action":    ["#c62828", "#4a0f0f"],
  "Adventure": ["#2e7d32", "#0f2e12"],
  "Animation": ["#fb8c00", "#6d3a00"],
  "Comedy":    ["#fdd835", "#7a6700"],
  "Crime":     ["#6d4c41", "#2a1c17"],
  "Drama":     ["#3949ab", "#161a47"],
  "Fantasy":   ["#8e24aa", "#2f0a38"],
  "Horror":    ["#6a1b9a", "#240638"],
  "Mystery":   ["#00838f", "#00282c"],
  "Romance":   ["#d81b60", "#4d0a24"],
  "Sci-Fi":    ["#1e88e5", "#0a2a4a"],
  "Thriller":  ["#455a64", "#12191c"]
};

// ----- data that is saved in Local Storage -----
let movies = [];        // array of movie objects (starts as a copy of defaultMovies)
let users = [];         // array of user objects: {id, name, email, password, role}
let watchlists = {};    // object: email -> array of movie ids      e.g. { "a@b.com": [3, 7] }
let diaries = {};       // object: email -> array of diary entries  e.g. { "a@b.com": [ {...}, {...} ] }

// ----- data that only lives while the page is open -----
let currentUser = null;     // the logged-in user object (null = nobody logged in)
let currentMovie = null;    // the movie that is open in the pop-up
let visibleCount = 24;      // how many movies the Movies page shows now
const pageSize = 24;        // how many more movies "Show more" adds


// ==========================================================
// 2. SMALL HELPER FUNCTIONS
// A function is a block of code with a name. We write it once and
// use it many times. Some functions "return" a value.
// ==========================================================

// Find an element in the page by its id (shorter than writing the long name)
function getEl(id) {
  return document.getElementById(id);
}

// Search the movies array and return the movie with this id
function findMovie(id) {
  for (let i = 0; i < movies.length; i++) {
    if (movies[i].id === id) {
      return movies[i];
    }
  }
  return null;   // not found
}

// 142 minutes  ->  "2h 22m"
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;      // % gives the remainder
  return hours + "h " + mins + "m";
}

// 3  ->  "★★★☆☆"
function makeStars(number) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= number) {
      stars = stars + "★";
    } else {
      stars = stars + "☆";
    }
  }
  return stars;
}

// Makes text safe before putting it inside HTML (stops people typing HTML code)
function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Today's date as "YYYY-MM-DD" (the format used by <input type="date">)
function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// Show a small message at the bottom of the screen for 2 seconds
function showToast(message) {
  const toast = getEl("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(function () {
    toast.classList.remove("show");
  }, 2000);
}

// True if the logged-in person is an admin
function isAdmin() {
  return currentUser !== null && currentUser.role === "admin";
}

// The watchlist (array) of the logged-in user. Creates an empty one if needed.
function getWatchlist() {
  if (watchlists[currentUser.email] === undefined) {
    watchlists[currentUser.email] = [];
  }
  return watchlists[currentUser.email];
}

// The diary (array) of the logged-in user
function getDiary() {
  if (diaries[currentUser.email] === undefined) {
    diaries[currentUser.email] = [];
  }
  return diaries[currentUser.email];
}

// Fill a <select> with the options from an array
function fillSelect(selectId, list, firstText) {
  let html = "";
  if (firstText !== "") {
    html = '<option value="All">' + firstText + '</option>';
  }
  for (let i = 0; i < list.length; i++) {
    html += '<option value="' + list[i] + '">' + list[i] + '</option>';
  }
  getEl(selectId).innerHTML = html;
}


// ==========================================================
// 3. LOCAL STORAGE
// Local Storage keeps data in the browser even after it is closed.
// It can only store text, so we use JSON.stringify (array -> text)
// and JSON.parse (text -> array).
// ==========================================================

function saveData() {
  localStorage.setItem("cinelogMovies", JSON.stringify(movies));
  localStorage.setItem("cinelogUsers", JSON.stringify(users));
  localStorage.setItem("cinelogWatchlists", JSON.stringify(watchlists));
  localStorage.setItem("cinelogDiaries", JSON.stringify(diaries));
}

// The two accounts that always exist the first time the site is opened
function makeDefaultUsers() {
  return [
    { id: 1, name: "Demo User", email: "user@gmail.com",  password: "1234",     role: "user" },
    { id: 2, name: "Admin",     email: "admin@gmail.com", password: "admin123", role: "admin" }
  ];
}

function loadData() {
  const savedMovies = localStorage.getItem("cinelogMovies");
  const savedUsers = localStorage.getItem("cinelogUsers");
  const savedWatchlists = localStorage.getItem("cinelogWatchlists");
  const savedDiaries = localStorage.getItem("cinelogDiaries");

  // getItem gives null when nothing was saved before
  movies = (savedMovies !== null) ? JSON.parse(savedMovies) : defaultMovies.slice();
  users = (savedUsers !== null) ? JSON.parse(savedUsers) : makeDefaultUsers();
  watchlists = (savedWatchlists !== null) ? JSON.parse(savedWatchlists) : {};
  diaries = (savedDiaries !== null) ? JSON.parse(savedDiaries) : {};
}


// ==========================================================
// 4. LOGIN, REGISTER, LOGOUT
// There are two roles: "user" and "admin".
// NOTE: real websites never keep passwords like this (they use a
// server and encryption). This is only a demo for a student project.
// ==========================================================

function showRegisterForm() {
  getEl("login-form").hidden = true;
  getEl("register-form").hidden = false;
  getEl("register-error").textContent = "";
}

function showLoginForm() {
  getEl("register-form").hidden = true;
  getEl("login-form").hidden = false;
  getEl("login-error").textContent = "";
}

function login(event) {
  event.preventDefault();       // stop the page from reloading

  const email = getEl("login-email").value.trim().toLowerCase();
  const password = getEl("login-password").value;
  const role = getEl("login-role").value;
  const error = getEl("login-error");

  // look for an account with this email
  let found = null;
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      found = users[i];
    }
  }

  if (email === "" || password === "") {
    error.textContent = "Please enter email and password.";
  } else if (found === null || found.password !== password) {
    error.textContent = "Wrong email or password.";
  } else if (found.role !== role) {
    error.textContent = "This is not " + (role === "admin" ? "an admin" : "a user") + " account. Change 'Login as'.";
  } else {
    error.textContent = "";
    startSession(found);
  }
}

function register(event) {
  event.preventDefault();

  const name = getEl("reg-name").value.trim();
  const email = getEl("reg-email").value.trim().toLowerCase();
  const password = getEl("reg-password").value;
  const confirm = getEl("reg-confirm").value;
  const error = getEl("register-error");

  // check if the email is already used
  let emailUsed = false;
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      emailUsed = true;
    }
  }

  if (name.length < 2) {
    error.textContent = "Name must have at least 2 characters.";
  } else if (email.indexOf("@") === -1 || email.indexOf(".") === -1) {
    error.textContent = "Please enter a valid email address.";
  } else if (emailUsed) {
    error.textContent = "This email is already registered.";
  } else if (password.length < 4) {
    error.textContent = "Password must have at least 4 characters.";
  } else if (password !== confirm) {
    error.textContent = "The two passwords are not the same.";
  } else {
    const newUser = { id: Date.now(), name: name, email: email, password: password, role: "user" };
    users.push(newUser);
    saveData();
    getEl("register-form").reset();
    startSession(newUser);
    showToast("Account created. Welcome, " + name + "!");
  }
}

// Called after a successful login or registration
function startSession(user) {
  currentUser = user;
  localStorage.setItem("cinelogSession", user.email);   // remember the login after refresh

  getEl("login-page").hidden = true;
  getEl("app").hidden = false;
  getEl("login-form").reset();

  getEl("current-user").textContent = user.name;
  getEl("role-badge").textContent = user.role;

  applyRole();
  showSection("dashboard");
  refreshAll();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("cinelogSession");
  getEl("app").hidden = true;
  getEl("login-page").hidden = false;
  showLoginForm();
}

// Hide the parts of the page that the person is not allowed to use
function applyRole() {
  const adminOnly = document.querySelectorAll(".admin-only");
  const userOnly = document.querySelectorAll(".user-only");

  for (let i = 0; i < adminOnly.length; i++) {
    adminOnly[i].hidden = !isAdmin();      // admin things are hidden for normal users
  }
  for (let i = 0; i < userOnly.length; i++) {
    userOnly[i].hidden = isAdmin();        // user things are hidden for the admin
  }
}


// ==========================================================
// 5. SECTIONS (NAVIGATION)
// Our "pages" are <section> elements. We show one and hide the others.
// ==========================================================

function showSection(name) {
  // A normal user must not open admin sections (and the other way round)
  if ((name === "users" || name === "reports") && !isAdmin()) {
    name = "dashboard";
  }
  if ((name === "watchlist" || name === "diary") && isAdmin()) {
    name = "dashboard";
  }

  for (let i = 0; i < sectionNames.length; i++) {
    const section = getEl("section-" + sectionNames[i]);
    const button = getEl("nav-" + sectionNames[i]);

    if (sectionNames[i] === name) {
      section.classList.add("active");
      button.classList.add("active");
    } else {
      section.classList.remove("active");
      button.classList.remove("active");
    }
  }

  getEl("page-title").textContent = sectionTitles[name];
  window.scrollTo(0, 0);
}


// ==========================================================
// 6. SHOWING MOVIE CARDS
// We build HTML as a text (string) and put it into the page
// using innerHTML.
// ==========================================================

// Poster made from the genre colours (CSS gradient)
function makePoster(movie, extraClass) {
  const colors = genreColors[movie.genre];   // read a value from the object
  return '<div class="poster ' + extraClass + '" style="background: linear-gradient(160deg, ' + colors[0] + ', ' + colors[1] + ');">' +
           '<span class="poster-year">' + movie.year + ' &bull; ' + escapeHTML(movie.genre) + '</span>' +
           '<span class="poster-title">' + escapeHTML(movie.title) + '</span>' +
         '</div>';
}

// HTML for ONE movie card
function makeCard(movie) {
  const title = escapeHTML(movie.title);
  let saveButton = "";
  let deleteButton = "";

  if (isAdmin()) {
    // admin gets a Delete button
    deleteButton = '<button type="button" class="delete-button" onclick="deleteMovie(' + movie.id + ')">Delete</button>';
  } else {
    // normal user gets the "+" watchlist button
    const isSaved = getWatchlist().indexOf(movie.id) !== -1;   // -1 means "not found"
    const saveClass = isSaved ? "save-button saved" : "save-button";    // ? : is a short if/else
    const saveSymbol = isSaved ? "&#10003;" : "+";
    const saveLabel = isSaved ? "Remove from watchlist" : "Add to watchlist";
    saveButton = '<button type="button" class="' + saveClass + '" onclick="toggleWatchlist(' + movie.id + ')" aria-label="' + saveLabel + ': ' + title + '">' + saveSymbol + '</button>';
  }

  return '<article class="card">' +
           '<span class="badge">&#9733; ' + movie.rating.toFixed(1) + '</span>' +
           saveButton +
           '<button type="button" class="poster-button" onclick="openDetails(' + movie.id + ')" aria-label="Open details of ' + title + '">' +
             makePoster(movie, "") +
           '</button>' +
           '<div class="card-info">' +
             '<h3>' + title + '</h3>' +
             '<p>' + movie.year + ' &bull; ' + formatDuration(movie.duration) + '</p>' +
           '</div>' +
           deleteButton +
         '</article>';
}

// Put a whole list of movies inside a grid.
function showMovies(list, gridId) {
  let html = "";
  for (let i = 0; i < list.length; i++) {
    html = html + makeCard(list[i]);
  }
  getEl(gridId).innerHTML = html;
}

// Returns a COPY of the movies sorted by rating (highest first)
function moviesByRating() {
  const copy = movies.slice();    // slice() makes a copy so the original is not changed
  copy.sort(function (a, b) {
    return b.rating - a.rating;
  });
  return copy;
}


// ==========================================================
// 7. DASHBOARD
// The numbers are different for a user and for the admin.
// ==========================================================

function showDashboard() {
  getEl("welcome-text").textContent = "Welcome, " + currentUser.name + "!";

  if (isAdmin()) {
    let totalEntries = 0;
    let totalSaves = 0;
    for (const email in diaries) { totalEntries += diaries[email].length; }
    for (const email in watchlists) { totalSaves += watchlists[email].length; }

    getEl("dash-1").textContent = movies.length;   getEl("dash-1-name").textContent = "Movies in library";
    getEl("dash-2").textContent = users.length;    getEl("dash-2-name").textContent = "Registered users";
    getEl("dash-3").textContent = totalSaves;      getEl("dash-3-name").textContent = "Watchlist saves";
    getEl("dash-4").textContent = totalEntries;    getEl("dash-4-name").textContent = "Diary entries";
  } else {
    const diary = getDiary();
    let total = 0;
    for (let i = 0; i < diary.length; i++) { total += diary[i].rating; }

    getEl("dash-1").textContent = movies.length;             getEl("dash-1-name").textContent = "Movies in library";
    getEl("dash-2").textContent = getWatchlist().length;     getEl("dash-2-name").textContent = "In my watchlist";
    getEl("dash-3").textContent = diary.length;              getEl("dash-3-name").textContent = "Films watched";
    getEl("dash-4").textContent = diary.length > 0 ? (total / diary.length).toFixed(1) + " ★" : "-";
    getEl("dash-4-name").textContent = "My average rating";

    showRecentDiary();
  }

  showMovies(moviesByRating().slice(0, 5), "top-grid");   // top 5 movies
}

// Last 5 diary entries of the user (small table on the dashboard)
function showRecentDiary() {
  const entries = sortedDiary().slice(0, 5);
  let rows = "";
  for (let i = 0; i < entries.length; i++) {
    const movie = findMovie(entries[i].movieId);
    if (movie !== null) {
      rows += "<tr><td>" + escapeHTML(movie.title) + "</td><td>" + entries[i].date + "</td><td class='table-stars'>" + makeStars(entries[i].rating) + "</td></tr>";
    }
  }
  getEl("recent-body").innerHTML = rows;
  getEl("recent-empty").hidden = (entries.length > 0);
}


// ==========================================================
// 8. SEARCH, FILTER AND SORT  (Movies section)
// ==========================================================

function applyFilters() {
  const text = getEl("search-input").value.toLowerCase().trim();
  const genre = getEl("genre-select").value;
  const language = getEl("language-select").value;
  const sortBy = getEl("sort-select").value;

  // Step 1: keep only movies that match the search text AND the genre AND the language
  const result = [];
  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    const searchable = (movie.title + " " + movie.director).toLowerCase();

    const textMatches = searchable.includes(text);
    const genreMatches = (genre === "All") || (movie.genre === genre);
    const languageMatches = (language === "All") || (movie.language === language);

    if (textMatches && genreMatches && languageMatches) {
      result.push(movie);
    }
  }

  // Step 2: sort the result
  result.sort(function (a, b) {
    if (sortBy === "rating") { return b.rating - a.rating; }
    if (sortBy === "newest") { return b.year - a.year; }
    if (sortBy === "oldest") { return a.year - b.year; }
    return a.title.localeCompare(b.title);      // sort by title A-Z
  });

  // Step 3: show only the first "visibleCount" movies
  const shown = result.slice(0, visibleCount);
  showMovies(shown, "browse-grid");

  getEl("result-text").textContent = "Showing " + shown.length + " of " + result.length + " matching movies (" + movies.length + " in library)";
  getEl("browse-empty").hidden = (result.length > 0);
  getEl("more-button").hidden = (result.length <= visibleCount);   // hide button when everything is shown
}

// When the user changes a filter we start again from the first 24 movies
function filterChanged() {
  visibleCount = pageSize;
  applyFilters();
}

function showMore() {
  visibleCount += pageSize;
  applyFilters();
}

function resetFilters() {
  getEl("search-input").value = "";
  getEl("genre-select").value = "All";
  getEl("language-select").value = "All";
  getEl("sort-select").value = "rating";
  filterChanged();
}

// Called when a genre button on the Dashboard is clicked
function chooseGenre(genre) {
  resetFilters();
  getEl("genre-select").value = genre;
  filterChanged();
  showSection("movies");
}

// Build the genre buttons from the genres array
function buildGenreChips() {
  let chipsHTML = "";
  for (let i = 0; i < genres.length; i++) {
    chipsHTML += '<button type="button" class="chip" onclick="chooseGenre(\'' + genres[i] + '\')">' + genres[i] + '</button>';
  }
  getEl("genre-chips").innerHTML = chipsHTML;
}


// ==========================================================
// 9. MOVIE DETAILS POP-UP
// ==========================================================

function openDetails(id) {
  const movie = findMovie(id);
  if (movie === null) {
    return;                  // stop the function if no movie was found
  }
  currentMovie = movie;

  getEl("details-poster").innerHTML = makePoster(movie, "poster-big");
  getEl("details-title").textContent = movie.title;
  getEl("details-meta").textContent = movie.year + " • " + formatDuration(movie.duration) + " • ★ " + movie.rating.toFixed(1) + " / 10";
  getEl("details-facts").innerHTML =
    "<dt>Director</dt><dd>" + escapeHTML(movie.director) + "</dd>" +
    "<dt>Genre</dt><dd>" + escapeHTML(movie.genre) + "</dd>" +
    "<dt>Language</dt><dd>" + escapeHTML(movie.language) + "</dd>" +
    "<dt>Year</dt><dd>" + movie.year + "</dd>";
  getEl("details-trailer").href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(movie.title + " " + movie.year + " trailer");

  updateDetailsButton();
  getEl("details-dialog").showModal();     // opens the pop-up
}

// Changes the text of the watchlist button inside the pop-up
function updateDetailsButton() {
  if (currentMovie === null || isAdmin()) {
    return;
  }
  if (getWatchlist().indexOf(currentMovie.id) !== -1) {
    getEl("details-watchlist").textContent = "✓ In your watchlist";
  } else {
    getEl("details-watchlist").textContent = "Add to watchlist";
  }
}


// ==========================================================
// 10. WATCHLIST
// ==========================================================

function toggleWatchlist(id) {
  const list = getWatchlist();
  const position = list.indexOf(id);

  if (position === -1) {
    list.push(id);                      // add at the end of the array
    showToast("Added to your watchlist");
  } else {
    list.splice(position, 1);           // remove 1 item at this position
    showToast("Removed from your watchlist");
  }

  saveData();
  refreshAll();
}

function showWatchlist() {
  const list = getWatchlist();
  const movieList = [];
  for (let i = 0; i < list.length; i++) {
    const movie = findMovie(list[i]);
    if (movie !== null) {
      movieList.push(movie);
    }
  }
  showMovies(movieList, "watchlist-grid");
  getEl("watchlist-empty").hidden = (movieList.length > 0);
}


// ==========================================================
// 11. DIARY FORM (with validation) AND DIARY TABLE
// Validation = checking the user's input before we use it.
// ==========================================================

function openLogForm() {
  if (currentMovie === null) {
    return;
  }
  getEl("log-form").reset();                          // clear old values
  getEl("log-movie-name").textContent = currentMovie.title;
  getEl("log-date").value = todayString();            // default = today
  getEl("log-date").max = todayString();              // cannot pick a future date
  getEl("log-error").textContent = "";
  getEl("review-chars").textContent = "0";
  getEl("log-dialog").showModal();
}

function saveDiaryEntry(event) {
  event.preventDefault();       // stop the page from reloading

  const date = getEl("log-date").value;
  const review = getEl("log-review").value.trim();
  const ratingBox = document.querySelector('input[name="rating"]:checked');   // the chosen star (or null)

  // ----- validation checks -----
  if (date === "") {
    getEl("log-error").textContent = "Please choose the date you watched the film.";
    return;
  }
  if (date > todayString()) {            // dates in this format can be compared as text
    getEl("log-error").textContent = "The date cannot be in the future.";
    return;
  }
  if (ratingBox === null) {
    getEl("log-error").textContent = "Please choose a star rating.";
    return;
  }
  if (review.length > 300) {
    getEl("log-error").textContent = "Review must be 300 characters or less.";
    return;
  }

  // ----- everything is OK: create an OBJECT and add it to the diary array -----
  const entry = {
    id: Date.now(),                      // current time in ms = a unique number
    movieId: currentMovie.id,
    date: date,
    rating: Number(ratingBox.value),     // convert text "4" to number 4
    review: review
  };
  getDiary().push(entry);
  saveData();

  getEl("log-dialog").close();
  refreshAll();
  showToast("Saved to your diary");
}

function removeEntry(entryId) {
  const sure = confirm("Remove this entry from your diary?");
  if (sure === false) {
    return;
  }
  const diary = getDiary();
  for (let i = 0; i < diary.length; i++) {
    if (diary[i].id === entryId) {
      diary.splice(i, 1);
      break;                             // stop the loop, we found it
    }
  }
  saveData();
  refreshAll();
  showToast("Entry removed");
}

// Returns a COPY of the diary, newest watch date first
function sortedDiary() {
  const entries = getDiary().slice();
  entries.sort(function (a, b) {
    if (a.date === b.date) {
      return b.id - a.id;
    }
    return a.date < b.date ? 1 : -1;
  });
  return entries;
}

function showDiary() {
  const entries = sortedDiary();

  let rows = "";
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const movie = findMovie(entry.movieId);
    if (movie === null) {
      continue;                          // skip this one and go to the next
    }
    const reviewText = entry.review === "" ? "No review" : escapeHTML(entry.review);

    rows += "<tr>" +
              "<td><strong>" + escapeHTML(movie.title) + "</strong><br><small class='muted'>" + movie.year + "</small></td>" +
              "<td>" + entry.date + "</td>" +
              "<td class='table-stars' title='" + entry.rating + " out of 5'>" + makeStars(entry.rating) + "</td>" +
              "<td>" + reviewText + "</td>" +
              "<td><button type='button' class='remove-button' onclick='removeEntry(" + entry.id + ")' aria-label='Remove diary entry for " + escapeHTML(movie.title) + "'>Remove</button></td>" +
            "</tr>";
  }
  getEl("diary-body").innerHTML = rows;

  const hasEntries = entries.length > 0;
  getEl("diary-table-wrap").hidden = !hasEntries;     // ! means NOT
  getEl("diary-empty").hidden = hasEntries;
  getEl("genre-stats-box").hidden = !hasEntries;

  showDiaryStats(entries);
}

function showDiaryStats(entries) {
  let totalRating = 0;
  let totalMinutes = 0;
  const genreCount = {};                 // empty OBJECT: will look like { Drama: 2, Action: 1 }

  for (let i = 0; i < entries.length; i++) {
    const movie = findMovie(entries[i].movieId);
    if (movie === null) {
      continue;
    }
    totalRating += entries[i].rating;
    totalMinutes += movie.duration;

    if (genreCount[movie.genre] === undefined) {
      genreCount[movie.genre] = 1;       // first time we see this genre
    } else {
      genreCount[movie.genre] += 1;
    }
  }

  getEl("stat-films").textContent = entries.length;
  getEl("stat-hours").textContent = (totalMinutes / 60).toFixed(1);
  getEl("stat-average").textContent = entries.length > 0 ? (totalRating / entries.length).toFixed(1) + " ★" : "-";

  const top = biggestKey(genreCount);
  getEl("stat-genre").textContent = top === "" ? "-" : top;
  getEl("genre-bars").innerHTML = makeBars(genreCount);
}

// Returns the key with the biggest value in an object ("" if the object is empty)
function biggestKey(counts) {
  let bestKey = "";
  let bestValue = 0;
  for (const key in counts) {            // "for...in" loops over the keys of an object
    if (counts[key] > bestValue) {
      bestValue = counts[key];
      bestKey = key;
    }
  }
  return bestKey;
}

// Turns an object like { Drama: 3, Action: 1 } into bar-chart HTML
function makeBars(counts) {
  const biggest = counts[biggestKey(counts)];
  let html = "";
  for (const key in counts) {
    const percent = (counts[key] / biggest) * 100;
    html += '<div class="bar-row"><span>' + escapeHTML(key) + '</span>' +
            '<div class="bar-track"><div class="bar-fill" style="width:' + percent + '%"></div></div>' +
            '<strong>' + counts[key] + '</strong></div>';
  }
  return html;
}


// ==========================================================
// 12. ADMIN: ADD / DELETE MOVIES, USERS, REPORTS
// ==========================================================

function openAddMovie() {
  getEl("add-form").reset();
  getEl("add-error").textContent = "";
  getEl("add-dialog").showModal();
}

function addMovie(event) {
  event.preventDefault();

  const title = getEl("new-title").value.trim();
  const director = getEl("new-director").value.trim();
  const year = Number(getEl("new-year").value);
  const duration = Number(getEl("new-duration").value);
  const rating = Number(getEl("new-rating").value);
  const error = getEl("add-error");

  // check if a movie with the same title and year already exists
  let exists = false;
  let biggestId = 0;
  for (let i = 0; i < movies.length; i++) {
    if (movies[i].title.toLowerCase() === title.toLowerCase() && movies[i].year === year) {
      exists = true;
    }
    if (movies[i].id > biggestId) {
      biggestId = movies[i].id;
    }
  }

  if (title === "" || director === "") {
    error.textContent = "Title and director are required.";
  } else if (year < 1900 || year > 2030) {
    error.textContent = "Year must be between 1900 and 2030.";
  } else if (duration < 30 || duration > 400) {
    error.textContent = "Duration must be between 30 and 400 minutes.";
  } else if (rating < 0 || rating > 10) {
    error.textContent = "Rating must be between 0 and 10.";
  } else if (exists) {
    error.textContent = "This movie is already in the library.";
  } else {
    movies.push({
      id: biggestId + 1,
      title: title,
      year: year,
      genre: getEl("new-genre").value,
      language: getEl("new-language").value,
      director: director,
      rating: rating,
      duration: duration
    });
    saveData();
    getEl("add-dialog").close();
    refreshAll();
    showToast("Movie added");
  }
}

function deleteMovie(id) {
  const movie = findMovie(id);
  if (movie === null || confirm('Delete "' + movie.title + '" from the library?') === false) {
    return;
  }
  for (let i = 0; i < movies.length; i++) {
    if (movies[i].id === id) {
      movies.splice(i, 1);
      break;
    }
  }
  saveData();
  refreshAll();
  showToast("Movie deleted");
}

function showUsers() {
  let rows = "";
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const saves = (watchlists[user.email] === undefined) ? 0 : watchlists[user.email].length;
    const entries = (diaries[user.email] === undefined) ? 0 : diaries[user.email].length;

    // the admin account cannot be removed
    let action = "-";
    if (user.role === "user") {
      action = "<button type='button' class='remove-button' onclick='removeUser(" + user.id + ")'>Remove</button>";
    }

    rows += "<tr>" +
              "<td>U" + String(i + 1).padStart(3, "0") + "</td>" +
              "<td>" + escapeHTML(user.name) + "</td>" +
              "<td>" + escapeHTML(user.email) + "</td>" +
              "<td><span class='role-tag'>" + user.role + "</span></td>" +
              "<td>" + saves + "</td>" +
              "<td>" + entries + "</td>" +
              "<td>" + action + "</td>" +
            "</tr>";
  }
  getEl("users-body").innerHTML = rows;
}

function removeUser(id) {
  if (confirm("Remove this user and all their data?") === false) {
    return;
  }
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      delete watchlists[users[i].email];   // delete removes a key from an object
      delete diaries[users[i].email];
      users.splice(i, 1);
      break;
    }
  }
  saveData();
  refreshAll();
  showToast("User removed");
}

function showReports() {
  let totalSaves = 0;
  let totalEntries = 0;
  const saveCount = {};          // movie title -> how many users saved it

  for (const email in watchlists) {
    totalSaves += watchlists[email].length;
    for (let i = 0; i < watchlists[email].length; i++) {
      const movie = findMovie(watchlists[email][i]);
      if (movie !== null) {
        saveCount[movie.title] = (saveCount[movie.title] === undefined) ? 1 : saveCount[movie.title] + 1;
      }
    }
  }
  for (const email in diaries) {
    totalEntries += diaries[email].length;
  }

  const genreCount = {};         // genre -> how many movies
  for (let i = 0; i < movies.length; i++) {
    const g = movies[i].genre;
    genreCount[g] = (genreCount[g] === undefined) ? 1 : genreCount[g] + 1;
  }

  getEl("rep-movies").textContent = movies.length;
  getEl("rep-users").textContent = users.length;
  getEl("rep-saves").textContent = totalSaves;
  getEl("rep-entries").textContent = totalEntries;

  const topTitle = biggestKey(saveCount);
  getEl("rep-top").textContent = (topTitle === "") ? "No saves yet" : topTitle + " (" + saveCount[topTitle] + ")";
  getEl("rep-bars").innerHTML = makeBars(genreCount);
}

function resetAllData() {
  if (confirm("This deletes all added movies, users, watchlists and diaries. Continue?") === false) {
    return;
  }
  localStorage.removeItem("cinelogMovies");
  localStorage.removeItem("cinelogUsers");
  localStorage.removeItem("cinelogWatchlists");
  localStorage.removeItem("cinelogDiaries");
  localStorage.removeItem("cinelogSession");
  location.reload();             // reload the page: everything starts from the default data
}


// ==========================================================
// 13. PROFILE, THEME, FEEDBACK FORM
// ==========================================================

function showProfile() {
  getEl("profile-name").textContent = currentUser.name;
  getEl("profile-email").textContent = currentUser.email;
  getEl("profile-role").textContent = currentUser.role;
  getEl("profile-watchlist").textContent = getWatchlist().length + " movies";
  getEl("profile-diary").textContent = getDiary().length + " entries";
}

function setTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light");
    getEl("theme-button").textContent = "Dark mode";
  } else {
    document.body.classList.remove("light");
    getEl("theme-button").textContent = "Light mode";
  }
  localStorage.setItem("cinelogTheme", theme);
}

function toggleTheme() {
  if (document.body.classList.contains("light")) {
    setTheme("dark");
  } else {
    setTheme("light");
  }
}

function sendFeedback(event) {
  event.preventDefault();

  const name = getEl("fb-name").value.trim();
  const email = getEl("fb-email").value.trim();
  const age = getEl("fb-age").value;
  const message = getEl("fb-message").value.trim();
  const error = getEl("feedback-error");
  getEl("feedback-success").textContent = "";

  if (name.length < 2) {
    error.textContent = "Name must have at least 2 characters.";
  } else if (email.indexOf("@") === -1 || email.indexOf(".") === -1) {
    error.textContent = "Please enter a valid email address.";
  } else if (age !== "" && (Number(age) < 10 || Number(age) > 100)) {
    error.textContent = "Age must be between 10 and 100.";
  } else if (message.length < 10) {
    error.textContent = "Message must have at least 10 characters.";
  } else {
    error.textContent = "";
    getEl("feedback-success").textContent = "Thank you, " + name + "! Your feedback was received.";
    getEl("feedback-form").reset();
  }
}


// ==========================================================
// 14. START OF THE PROGRAM
// ==========================================================

// Redraws everything that depends on the data (only when someone is logged in)
function refreshAll() {
  if (currentUser === null) {
    return;
  }
  showDashboard();
  applyFilters();
  showProfile();

  if (isAdmin()) {
    showUsers();
    showReports();
  } else {
    showWatchlist();
    showDiary();
    getEl("watchlist-count").textContent = getWatchlist().length;
    getEl("diary-count").textContent = getDiary().length;
  }
  updateDetailsButton();
}

// ----- EVENTS: "when this happens, run that function" -----
getEl("login-form").addEventListener("submit", login);
getEl("register-form").addEventListener("submit", register);
getEl("show-register").addEventListener("click", function (event) {
  event.preventDefault();
  showRegisterForm();
});
getEl("show-login").addEventListener("click", function (event) {
  event.preventDefault();
  showLoginForm();
});
getEl("logout-button").addEventListener("click", logout);
getEl("theme-button").addEventListener("click", toggleTheme);

getEl("search-input").addEventListener("input", filterChanged);      // every key press
getEl("genre-select").addEventListener("change", filterChanged);
getEl("language-select").addEventListener("change", filterChanged);
getEl("sort-select").addEventListener("change", filterChanged);
getEl("reset-button").addEventListener("click", resetFilters);
getEl("more-button").addEventListener("click", showMore);
getEl("add-movie-button").addEventListener("click", openAddMovie);
getEl("reset-data-button").addEventListener("click", resetAllData);

getEl("details-watchlist").addEventListener("click", function () {
  toggleWatchlist(currentMovie.id);
});
getEl("details-log").addEventListener("click", function () {
  getEl("details-dialog").close();
  openLogForm();
});
getEl("details-close").addEventListener("click", function () {
  getEl("details-dialog").close();
});
getEl("log-close").addEventListener("click", function () {
  getEl("log-dialog").close();
});
getEl("add-close").addEventListener("click", function () {
  getEl("add-dialog").close();
});

// Click on the dark area outside a pop-up closes it
const dialogIds = ["details-dialog", "log-dialog", "add-dialog"];
for (let i = 0; i < dialogIds.length; i++) {
  getEl(dialogIds[i]).addEventListener("click", function (event) {
    if (event.target === event.currentTarget) {
      event.currentTarget.close();
    }
  });
}

// Live character counter for the review box
getEl("log-review").addEventListener("input", function () {
  getEl("review-chars").textContent = getEl("log-review").value.length;
});

getEl("log-form").addEventListener("submit", saveDiaryEntry);
getEl("add-form").addEventListener("submit", addMovie);
getEl("feedback-form").addEventListener("submit", sendFeedback);

// ----- RUN WHEN THE PAGE OPENS -----
try {
  loadData();
} catch (error) {
  movies = defaultMovies.slice();      // if saved data is damaged, start fresh
  users = makeDefaultUsers();
  watchlists = {};
  diaries = {};
}

setTheme(localStorage.getItem("cinelogTheme") === "light" ? "light" : "dark");
fillSelect("genre-select", genres, "All genres");
fillSelect("language-select", languages, "All languages");
fillSelect("new-genre", genres, "");
fillSelect("new-language", languages, "");
buildGenreChips();

// If the person was already logged in before the refresh, log in again automatically
const savedEmail = localStorage.getItem("cinelogSession");
if (savedEmail !== null) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === savedEmail) {
      startSession(users[i]);
    }
  }
}
