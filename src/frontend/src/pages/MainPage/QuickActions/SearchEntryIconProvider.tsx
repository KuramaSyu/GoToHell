import { ReactElement } from 'react';
import { SvgIcon } from '@mui/material';
import { sportIconMap } from '../../../utils/data/Sports';
import { GameEntry, SearchEntry, SportEntry } from './SearchEntry';

export class SearchEntryIconProvider {
  static getIcon(
    entry: SearchEntry,
    sx: object = {} // replace style with sx
  ): ReactElement | null {
    if (entry instanceof SportEntry) {
      const IconComponent = sportIconMap[String(entry.name)];
      if (!IconComponent) return null;

      return (
        <SvgIcon
          component={IconComponent}
          sx={{
            color: (theme) => theme.palette.text.primary,
            height: 42,
            width: 42,
            ...sx, // merge additional sx if passed
          }}
          inheritViewBox
        />
      );
    }

    if (entry instanceof GameEntry) {
      return null;
    }

    return null;
  }
}
