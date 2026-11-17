# CineLog – Movie Discovery, Rating & Personal Diary
CSC 326 – Internet Programming | HTML5 + CSS3 + JavaScript only

## How to run
Double-click `index.html`. No installation, no server, no internet needed
(only the map on the About section needs internet).

## Login details (shown on the login page too)
| Role | Email | Password |
|---|---|---|
| User  | user@gmail.com  | 1234 |
| Admin | admin@gmail.com | admin123 |

A new user can also click **Create an account** (name, email, password).
The login stays after refresh until you press **Logout**.

## Folder structure
```
CineLog/
├── index.html        ← structure (login page + app + pop-ups)
├── css/style.css     ← design, layout, animations, responsive
├── js/movies.js      ← DATA: array of 122 movie objects
├── js/script.js      ← LOGIC: login, roles, search, watchlist, diary, admin
└── media/            ← intro.mp4 (video) and chime.mp3 (audio)
```
Why 3 separate code files? **Separation of concerns**: HTML = content, CSS = style, JS = behaviour.

## What each role can do
| Feature | User | Admin |
|---|:-:|:-:|
| Dashboard with statistics | ✔ (own numbers) | ✔ (whole-site numbers) |
| Search / filter (genre, language) / sort 122 movies | ✔ | ✔ |
| Movie details pop-up + trailer link | ✔ | ✔ |
| Watchlist (+ button) | ✔ | – |
| Diary: star rating, date, review, table, statistics | ✔ | – |
| Add a new movie (form with validation) | – | ✔ |
| Delete a movie | – | ✔ |
| Users table + remove a user | – | ✔ |
| Reports (totals, most-watchlisted movie, movies per genre) | – | ✔ |
| Profile, About (video, audio, iframe, feedback form), dark/light theme | ✔ | ✔ |

Each user has **their own** watchlist and diary. They are stored in Local Storage as objects
keyed by email, e.g. `watchlists = { "user@gmail.com": [1, 5, 9] }`.

## Syllabus checklist (where each topic is used)
### Unit I – HTML Fundamentals
| Topic | Where |
|---|---|
| Document structure, `<head>`, meta tags | top of `index.html` |
| Elements & attributes, text formatting | `<strong>`, `<em>`, `<small>`, `class`, `id` everywhere |
| Lists | `<ul>` / `<ol>` in About, sidebar menu |
| Hyperlinks | skip link, "Create an account", trailer link `target="_blank"` |
| SVG graphics | film-reel logo (login page + sidebar) |
| Audio / Video / iframe | About section |
| SEO | `<title>`, meta description/keywords, headings in order, `lang="en"` |
### Unit II – Semantic HTML & Forms
| Topic | Where |
|---|---|
| Semantic elements | `<header> <nav> <aside> <main> <section> <article> <footer> <dialog>` |
| Accessibility | skip link, `aria-label`, `<label for>`, `<fieldset>/<legend>`, focus outline, `role="alert"` |
| Forms & input types | `email, password, search, text, number, date, radio, checkbox, textarea, select` |
| Validation basics | `required`, `minlength`, `maxlength`, `min`, `max`, `step` + JS checks |
| Tables | diary table, users table, dashboard table (`<caption> <thead> <tbody> <th scope>`) |
| Responsive structure | `<meta viewport>` |
### Unit III – CSS
| Topic | Where in `style.css` |
|---|---|
| Selectors, specificity | element, class, id (`#login-page`), universal `*`, descendant |
| Attribute selectors | `input[type="text"]`, `a[target="_blank"]`, `[hidden]` |
| Pseudo-classes | `:hover`, `:focus`, `:focus-visible`, `:nth-child(even)`, `:checked`, `:valid` |
| Pseudo-elements | `.poster::before` (shine), `a::after` (arrow), `dialog::backdrop` |
| Colours, units | hex/rgba/gradients; `rem`, `%`, `px`, `vw`, `vh`, `fr` |
| Box model | `box-sizing`, padding, border, margin |
| Positioning | `fixed` sidebar, `sticky` top bar, `absolute` badge, `fixed` toast |
| Flexbox | login centring, sidebar, top bar, chips |
| Grid | movie cards, filter bar, statistics |
| CSS Variables | `:root { --accent … }`, dark/light theme |
| Transitions / Animations | card hover, button hover, `@keyframes fadeIn / popIn` |
| Responsive | `@media (max-width: 1000px / 800px / 560px)` |
### Unit IV – JavaScript (all in `script.js`)
| Topic | Example |
|---|---|
| Variables, constants | `let movies = []`, `const genres = [...]` |
| Data types | string, number, boolean, `null`, `undefined`, array, object |
| Operators | `+ - * / %`, `=== !==`, `&&`, `||`, `!`, `+=`, ternary `? :` |
| Strings | `toLowerCase, trim, includes, slice, replace, padStart, indexOf` |
| Numbers / Boolean | `toFixed, Math.floor, Number()`, `isAdmin()` returns true/false |
| Conditionals | `if / else if / else` in login, register and validation |
| Functions | 58 small functions, with parameters and `return` |
| Scope | variables inside functions (local) vs top-of-file variables (global) |
| Arrays | `push, splice, slice, sort, indexOf`, `for` loops |
| Objects | movie / user objects, `genreColors`, `watchlists`, `for…in`, `delete` |

*(Selecting elements, events and Local Storage are the minimum DOM tools needed to make a web app work, so they are used, but kept very simple.)*

## How the important parts work (for the viva)
**Login:** `login()` loops through the `users` array to find the email, compares the password, and checks that the "Login as" role matches the account. If all is correct, `startSession()` hides the login page, shows the app and calls `applyRole()`.

**Roles:** every account object has `role: "user"` or `"admin"`. Menu items and buttons have class `user-only` or `admin-only`; `applyRole()` hides the ones the person should not see using the `hidden` attribute. `showSection()` also blocks a user from opening admin sections.

**Where is data stored?** In the browser's Local Storage with `setItem()` / `getItem()`. It only stores text, so we use `JSON.stringify()` to save arrays/objects and `JSON.parse()` to read them back. The list of 122 movies starts in `movies.js` and the copy in Local Storage changes when the admin adds/deletes movies.

**Why are passwords stored as plain text?** Only because this is a front-end demo with no server. Real websites check passwords on a server and store them encrypted (hashed).

**Why not use the Fetch API / a JSON file?** `fetch()` does not work when you open a file by double-click (needs a web server). So the movies are a JavaScript array in `movies.js`. (Upgrade: save as `movies.json` and use `fetch("movies.json")` with a local server.)

**How does search work?** On every key press (`input` event) `applyFilters()` loops through `movies`, keeps those where title/director includes the text and genre + language match, sorts them, and shows the first 24. "Show more" adds 24 more.

**How is a card created?** `makeCard()` joins strings into HTML text and `innerHTML` puts it in the grid. Posters are CSS gradients coloured by genre (from the `genreColors` object).

**How do sections switch?** All sections have `display:none`; `showSection()` adds the class `active` to one of them.

**How does the star rating work?** 5 hidden radio buttons + labels styled as stars, written 5→1 and shown reversed with `flex-direction: row-reverse`, so the CSS `~` selector can colour every star up to the chosen one.

**How do you validate forms?** Two layers: HTML attributes (`required`, `minlength`, `max`) and JavaScript checks that show a message in a `role="alert"` paragraph.

**Why `event.preventDefault()`?** A form normally reloads the page when submitted. This stops that so JavaScript can handle the data.

**Why `escapeHTML()`?** A user could type `<script>` in a review or name. Converting `<` and `>` to `&lt;` / `&gt;` makes it plain text (security).

**`let` vs `const`?** `let` can be reassigned, `const` cannot. Arrays declared with `const` can still have items added.

**`==` vs `===`?** `===` also checks the data type (`5 === "5"` is false). We always use `===`.

**Flexbox vs Grid?** Flexbox lays items in one direction (row or column) – used for the sidebar and top bar. Grid does rows and columns together – used for the movie cards.

**What is responsive design?** The page adapts to screen size using relative units, `auto-fill` grid and `@media` queries (on phones the sidebar becomes a top menu).

**What is semantic HTML?** Tags that describe their meaning (`<nav>`, `<aside>`, `<main>`, `<footer>`) – better for accessibility and SEO than many `<div>`s.

**What does `<dialog>` do?** A built-in pop-up. `showModal()` opens it, `close()` closes it, Esc key works automatically.

## Ideas if you want to extend it later
- Add a "Favourites" list (copy the watchlist code).
- Add real poster images in an `images/` folder.
- Move data to `movies.json` and load with `fetch()`.
