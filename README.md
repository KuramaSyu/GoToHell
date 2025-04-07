### What is this Project and what is it for?

A project, which aims to help me, to make sport while playing games, with the main idea, of
making a specific amount of sport, whenever you die in a game.
The main goal was, to replace a Google Sheet, where we wrote in what sport we did
in what amount. Hence this projects goal is to not only show you your progress, but also the
progress of your friends

### TODO:

- an `generateLabel() -> HTML Comp.` method, for `SportCalculator` where labels like `x2` for multipliers or `18` (just the overridden number) if a. override happened or just `base: 18` if the base was used, to show labels more transparent

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
