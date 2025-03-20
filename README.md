### What is this Project and what is it for?
A project, which aims to help me, to make sport while playing games, with the main idea, of
making a specific amount of sport, whenever you die in a game.
The main goal was, to replace a Google Sheet, where we wrote in what sport we did
in what amount. Hence this projects goal is to not only show you your progress, but also the
progress of your friends


### TODO:
- add get /api/sports to upload button, after clicking
- set zustand to total amount
- make animation of number to "upload to a cloud"
- remove useless imports
- animated background for upload button, using gradiant

### Things required to add a game:
- an entry in the default sports in `src/backend/config/default_sports.csv`
- the definition for the frontend in `src/frontend/src/zustand/useThemeStore.ts` in this format:
  ```json
  export const customThemes: CustomThemeConfig[] = [
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
        'https://url.to_background_1.png', 'https://url.to_background_2.png'
      ]
    }
  ];
  ```
