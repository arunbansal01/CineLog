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
