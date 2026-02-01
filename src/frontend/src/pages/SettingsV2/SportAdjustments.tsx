import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Typography from '@mui/material/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import { useThemeStore } from '../../zustand/useThemeStore';
import { Grid, Stack } from '@mui/material';
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
  const multipliers = usePreferenceStore().preferences.multipliers;
  const { preferencesLoaded } = usePreferenceStore();
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
      { game: null, sport: sport, multiplier: calc.current.rate(rating) },
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
  return (
    <>
      <Grid size={3} key={`${sport.name}1`}>
        <Typography>{sport.displayName()}</Typography>
      </Grid>
      <Grid size={9} key={`${sport.name}2`}>
        <Rating
          value={value}
          onChange={(_, newValue) => {
            if (newValue === undefined || value === null) return;
            setValue(newValue!);
            onClick(sport.name, newValue! / 10); // onClick accepts a value from 0 - 1
          }}
          precision={0.5}
          getLabelText={(value: number) =>
            `${value} Starts${value !== 1 ? 's' : ''}`
          }
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
      </Grid>
    </>
  );
};
