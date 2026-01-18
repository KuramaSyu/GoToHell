import PushupIcon from '../../assets/variable/sports-pushup.svg?react';
import PlankIcon from '../../assets/variable/sports-plank.svg?react';
import PilatesIcon from '../../assets/variable/sports-pilates.svg?react';
import SquatsIcon from '../../assets/variable/sports-squats.svg?react';
import SitupsIcon from '../../assets/variable/sports-situps.svg?react';
import RussianTwistIcon from '../../assets/variable/sports-russian_twist.svg?react';
import DipIcon from '../../assets/variable/sports-dip.svg?react';
import LegRaisesIcon from '../../assets/variable/sports-leg_raises.svg?react';
import LungesIcon from '../../assets/variable/sports-lunges.svg?react';
import GluteBridgesIcon from '../../assets/variable/sports-glute_bridges.svg?react';
import JoggingIcon from '../../assets/variable/sports-jogging.svg?react';
import CyclingIcon from '../../assets/variable/sports-cycling.svg?react';
import type { FC, SVGProps } from 'react';

export type SvgIconComponent = FC<SVGProps<SVGSVGElement>>;

export const sportIconMap: Record<string, SvgIconComponent> = {
  pushup: PushupIcon,
  plank: PlankIcon,
  pilates: PilatesIcon,
  squats: SquatsIcon,
  situps: SitupsIcon,
  russian_twist: RussianTwistIcon,
  dip: DipIcon,
  leg_raises: LegRaisesIcon,
  lunges: LungesIcon,
  glute_bridges: GluteBridgesIcon,
  jogging: JoggingIcon,
  workout: PilatesIcon,
  cycling: CyclingIcon,
};

// map for which is shown next to the score
export const GameSelectionMap: Map<String, String> = new Map();
GameSelectionMap.set('pushup', 'Push-Ups');
GameSelectionMap.set('plank', 'Seconds Plank');
GameSelectionMap.set('pilates', 'Exercises');
GameSelectionMap.set('situps', 'Sit-Ups');
GameSelectionMap.set('squats', 'Squats');
GameSelectionMap.set('russian_twist', 'Russian Twists');
GameSelectionMap.set('dip', 'Dips');
GameSelectionMap.set('leg_raises', 'Leg Raises');
GameSelectionMap.set('lunges', 'Lunges');
GameSelectionMap.set('glute_bridges', 'Glute Bridges');
GameSelectionMap.set('jogging', 'Meters Jogging');
GameSelectionMap.set('workout', 'Seconds Workout');
GameSelectionMap.set('cycling', 'Meters Cycling');
