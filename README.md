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

### Api Documentation

Can be found here: [gotohell.inu-the-bot.com/docs](https://gotohell.inu-the-bot.com/docs)


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

### Things required to add a new sport:

- an entry for the new sport in `src/frontend/src/utils/data/Multipliers.json`:

  ```js
  {
    "sports": {
      "pushup": 2.5,
      "plank": 10,
      // ...
      // "sport": base_unit (will be multiplied with the game base)
    },

  }
  ```

- 2 map entries and 1 import in `src/frontend/src/utils/data/Sports.ts`:

```ts
import pushupSVG from '../../assets/sports-pushup.svg';
import plankSVG from '../../assets/sports-plank.svg';
// ...
// import newSportSVG from '../../assets/new-sport.svg';

export const sportIconMap: Record<string, string> = {
  pushup: pushupSVG,
  plank: plankSVG,
  // ...
  // new_sport: newSportSVG,

// map for which is shown next to the score
export const GameSelectionMap: Map<String, String> = new Map();
GameSelectionMap.set('pushup', 'Push-Ups');
GameSelectionMap.set('plank', 'Seconds Plank');
// GameSelectionMap.set('new-sport-display-name', 'Sport unit after the number');

};
```

# Development

## Installation & Start

### Start via docker-compose
Create a `.env` file with the contents like in `.example-env` within the root dir. This will then be used by docker compose
for both frontend and backend

### Install Dependencies

```
npm install
```

### Set frontend config:

Either use the arg `BACKEND_URL` in the docker container or set a `.env` in the `src/frontend` directory with
contents like in `src/frontend/.example-env`. It's important to add a `VITE_` to the ENV vars, if not set
via docker (hence when running locally)

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

### Set backend `.env` file

use the `.example-env` as template and fill out

### Building swagger docs out of Go comments:

install `swag`:

```
go install github.com/swaggo/swag/cmd/swag@latest
```

```
cd src/backend/src
swag init
```

### Backend naming conventions:

- For Get/Post/Put/Delete Requests/Replies: `[Method][ModelName][Reply|Request]`
- For Controllers: `[ModelName]Controller`
- For Controller methods: pain `Get()`, `Post()`, `Put()`, `Delete()`
- For API routes: `kebab-case`

