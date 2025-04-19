### What is this Project and what is it for?

A project, which aims to help me, to make sport while playing games, with the main idea, of
making a specific amount of sport, whenever you die in a game.
The main goal was, to replace a Google Sheet, where we wrote in what sport we did
in what amount. Hence this projects goal is to not only show you your progress, but also the
progress of your friends

### TODO:
#### Done
- [x] make plank formula changable in settings. 

#### Ongoing
- [ ] move API calls to utils/api
- [ ] add functions to these apis, which only fetch, if zustand store has nothing stored in it

#### Features
- presets, which set plank seconds and multiplier asking the user how much sports he want to do
- 2 Buttons for Multiplier; one global one local
- box for dragging workouts in. Upload multiple things at once
- Games and Sports selectable via a 2-sided drag and drop, so that sorting is also possible. For adding, selecting it should be sufficient
#### Fixes / QoL
- number in custom and other inputs has anoying 0 which is not deletable. Maybe accept string, and convert string

### Things required to add a game:

- an entry in the default sports in `src/backend/config/default_sports.csv`
- the definition for the frontend in `src/frontend/src/theme/themes.json` in this format:

  ```json
  [
    // example for Teamfight Tactics
    {
      "name": "tft",
      "longName": "Teamfight Tactics",
      "backgrounds": [
        "https://i.postimg.cc/cCc5PpJN/wp7407642-little-legends-wallpapers.jpg",
        "https://i.postimg.cc/k4kdHDQk/teamfight-tactics-galaxies-penguin-featherknight-uhdpaper-com-4-K-7-1270.jpg"
      ]
    },

    // your new game
    {
      "name": "your new game",
      "longName": "the actuall full name",
      "backgrounds": [
        "https://url.to_background_1.png",
        "https://url.to_background_2.png"
      ]
    }
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
