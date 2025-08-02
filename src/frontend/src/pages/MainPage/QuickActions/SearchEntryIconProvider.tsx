import { ReactElement } from 'react';
import { GameEntry, SearchEntry, SportEntry } from './SearchEntry';
import { sportIconMap } from '../../../utils/data/Sports';

export class SearchEntryIconProvider {
  static getIcon(
    entry: SearchEntry,
    style: React.CSSProperties = {}
  ): ReactElement | null {
    if (entry instanceof SportEntry) {
      return (
        <img
          src={sportIconMap[String(entry.name)]}
          alt={String(entry.name)}
          style={style}
        />
      );
    } else if (entry instanceof GameEntry) {
      return null;
    }
    return null;
  }
}
