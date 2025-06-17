### What is this Project and what is it for?

A project, which aims to help me, to make sport while playing games, with the main idea, of
making a specific amount of sport, whenever you die in a game.
The main goal was, to replace a Google Sheet, where we wrote in what sport we did
in what amount. Hence, this projects goal is to not only show you your progress, but also the
progress of your friends
**Important:** Without the discord login, this website is basically useless! I decided to use
Discord, since most people playing games in their leisure time, including me, use it. Hence, I don't need
to think about storing passwords, and I also have access to their Avatars, which make the site more appealing.

**Is it somewhere running?**
Yes, it's currently running here: [gotohell.inu-the-bot.com](https://gotohell.inu-the-bot.com)

### TODO:

#### Done

- [x] make plank formula changeable in settings.
- [x] Games and Sports selectable via a 2-sided drag and drop, so that sorting is also possible. For adding, selecting it should be sufficient
- [x] 2 Buttons for Multiplier; one global one local
- [x] Display sports in order
- [x] Keyboard Shortcuts:
  - ESC to exit settings to /
  - Quick Action Modal for:
    - Number, to set deaths
    - Letter, to set games and sports
    - Enter, to upload

#### Ongoing

- [ ] move API calls to utils/API
  - standard.tsx: DELETE api/sports
  - Sport.tsx: POST api/sports
- [ ] add functions to these APIs, which only fetch, if zustand store has nothing stored in it
- [ ] separate repository for background pictures
- [ ] implement 2 missing functions for UserApi

#### Features

- [ ] update script: make a backup of db in same folder under backups/iso-date.sql
- [ ] Presets, which set plank seconds and multiplier asking the user how many sports he wants to do
- [ ] box for dragging workouts in. Upl oad multiple things at once
- [ ] when auto opend modal, close it after 10 seconds of inactivity
- [ ] UI: move number description always below number, move tab selection left next to the content, to get more space

#### Fixes

- Pushup Tooltip: Zindex >1100
- Plank: don't show tooltip in the middle of the box
- Reloading in Settings sets Streak to 0

#### QoL

- [ ] Show all multipliers in the settings
- [ ] better animate TimeDisplay
- [ ] add time (seconds) parameter to setErrorMessage. Maybe implement a queue for multiple errors where each error has fields (title, description, timeout)
- [ ] add a function to theme, to return primary/secondary color, but brightend up if it's too dark (for better contrast in app bar)

#### Perf

- [ ] Backend Delete Sport: add userid to db request, instead of making multiple requests

#### Ideas

- [ ] Go Loading icon
- [ ] Linking, who invited who, displaying a tree of all users, showing you, how you probably get here
- [ ] Websocket connection, saying when timeline got an update (api request -> Observer -> listener for ongoing connections (maybe even directly send data?))

### Things required to add a game:

- an entry for the new game in `src/frontend/src/utils/data/Multipliers.json`:

  ```js
  {
    "sports": {
      "pushup": 2.5,
      "plank": 10,
      // ...
    },
    "games": {
      "overwatch": 1,
      "league": 1.5,
      "tft": 1,
      "your new game": 1  // compared to overwatch, is the average death amount
                          // within 30 minutes higher (then value <1)
                          // or lower (value >1)
    }
  }
  ```

- the definition for the frontend in `src/frontend/src/theme/themes.json` in this format:

  ```js
  [
    // example for Teamfight Tactics
    {
      name: 'tft',
      longName: 'Teamfight Tactics',
      backgrounds: [
        'https://i.postimg.cc/cCc5PpJN/wp7407642-little-legends-wallpapers.jpg',
        'https://i.postimg.cc/k4kdHDQk/teamfight-tactics-galaxies-penguin-featherknight-uhdpaper-com-4-K-7-1270.jpg',
      ],
    },

    // your new game
    {
      name: 'your new game',
      longName: 'the actuall full name',
      backgrounds: [
        'https://url.to_background_1.png',
        'https://url.to_background_2.png',
      ],
    },
  ];
  ```

# Development

## Installation & Start

### Install Dependencies

...

### Starting Website:

- Frontend:
  ```bash
  cd src/frontend
  npm run dev
  ```
- Backend:
  ```bash
  cd src/backend/src
  go run main.go
  ```
