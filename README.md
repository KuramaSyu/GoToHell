TODO:
- add get /api/sports to upload button, after clicking
- set zustand to total amount
- make animation of number to "upload to a cloud"
- remove useless imports
- animated background for upload button, using gradiant

### Things required to add a game:
- a theme in `src/frontend/src/themes.ts`
- an entry in the default sports in `src/backend/config/default_sports.csv`
- the definition for the frontend in `src/frontend/src/zustand/useThemeStore.ts` in this format:
  ```json
  export const customThemes: CustomThemeConfig[] = [
    // example for League of Legends
    {
      name: 'league',
      longName: 'League of Legends',
      backgrounds: [
        'https://i.postimg.cc/pXb4tvd8/zeri-lol-moon-snow-art-hd-wallpaper-uhdpaper-com-522-5-c.jpg',
      ],
    },

    // your new game
    {
      name: 'your new game',
      longName: 'the actuall full name',
      backgrounds: [
        'url_to_background_1.png', 'url_to_background_2.png'
      ]
    }
  ];
  ```
