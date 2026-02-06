import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Typography from '@mui/material/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import { useThemeStore } from '../../zustand/useThemeStore';
import { Button, Grid, Stack } from '@mui/material';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import { SportEntry } from '../MainPage/QuickActions/SearchEntry';
import { useRef, useState } from 'react';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { Multiplier } from '../../models/Preferences';
import {
  IRatingCalculator,
  Rating0to3Calculator,
} from '../../utils/ratingCalculator';

export const SportAdjustments: React.FC = () => {
  const { sportResponse } = useSportResponseStore();
  const sportEntries = useSportResponseStore().getSportEntryMap();
  const multipliers = usePreferenceStore(
    (state) => state.preferences.multipliers,
  );
  const preferencesLoaded = usePreferenceStore(
    (state) => state.preferencesLoaded,
  );
  const calc = useRef<IRatingCalculator>(new Rating0to3Calculator());

  const getPreferencesMultiplier = (sport: string): number | null => {
    return (
      multipliers.filter((x) => x.game === null && x.sport == sport)[0]
        ?.multiplier ?? null
    );
  };

  const onRatingSave = (sport: string, rating: number) => {
    console.log(`save rating: ${sport} ${calc.current.rate(rating)}`);
    var preferences = usePreferenceStore.getState().preferences;

    const multipliers: Multiplier[] = [
      {
        game: null,
        sport: sport,
        multiplier: Math.round(calc.current.rate(rating) * 100) / 100,
      },
      ...preferences.multipliers.filter(
        (x) => !(x.game === null && x.sport == sport),
      ),
    ];
    usePreferenceStore.getState().setPreferences({
      ...preferences,
      multipliers: multipliers,
    });
  };

  if (!preferencesLoaded) return null;
  return (
    <Grid container width={'100%'}>
      {Object.keys(sportResponse.sports)?.map((sport) => {
        const entry = sportEntries.get(sport);
        if (!entry) return null;
        return (
          <SingleSportAdjustment
            onClick={onRatingSave}
            sport={entry}
            currentValue={
              calc.current.reverse(getPreferencesMultiplier(sport)) ?? 0.5
            }
          />
        );
      })}
    </Grid>
  );
};

interface SingleSportAdjustmentProps {
  sport: SportEntry;
  onClick: (sport: string, rating: number) => void;
  currentValue: number; // 0 - 1
}

export const SingleSportAdjustment: React.FC<SingleSportAdjustmentProps> = ({
  sport,
  onClick,
  currentValue,
}) => {
  const { theme } = useThemeStore();
  const [value, setValue] = useState<number>(currentValue * 10);

  const labels: { [index: string]: string } = {
    1: 'Hate',
    2: 'Dislike',
    3: 'Bad',
    4: 'Below Average',
    5: 'Average',
    6: 'Above Average',
    7: 'Good',
    8: 'Great',
    9: 'Pro',
    10: 'Olimpian',
  };

  /**
   * return nearest label for rating
   * @param value rating
   */
  const getLabel = (value: number) => {
    const rounded = Math.round(value);
    return labels[rounded] ?? '';
  };

  return (
    <>
      <Grid size={3} key={`${sport.name}1`}>
        <Typography>{sport.displayName()}</Typography>
      </Grid>
      <Grid size={9} key={`${sport.name}2`}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Rating
            value={value}
            onChange={(_, newValue) => {
              if (newValue === undefined || value === null) return;
              setValue(newValue!);
              onClick(sport.name, newValue! / 10); // onClick accepts a value from 0 - 1
            }}
            precision={0.5}
            getLabelText={(value: number) => `${value}, ${getLabel(value)}`}
            max={10}
            sx={{
              '& .MuiRating-iconFilled': {
                color: theme.palette.primary.main,
              },
              '& .MuiRating-iconHover': {
                color: theme.palette.primary.light,
              },
            }}
            size='large'
          />
          {value !== null && <Box sx={{ ml: 2 }}>{getLabel(value)}</Box>}
        </Stack>
      </Grid>
    </>
  );
};

export const ResetSportAdjustmentsLogic = () => {
  const preferences = usePreferenceStore.getState().preferences;
  const multipliers: Multiplier[] = preferences.multipliers.filter(
    (x) => x.game !== null || (x.game === null && x.sport == null),
  );
  usePreferenceStore.getState().setPreferences({
    ...preferences,
    multipliers: multipliers,
  });
};
