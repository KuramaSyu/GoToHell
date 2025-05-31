import pushupSVG from '../../assets/sports-pushup.svg';
import plankSVG from '../../assets/sports-plank.svg';
import pilatesSVG from '../../assets/sports-pilates.svg';
import squatsSVG from '../../assets/sports-squats.svg';
import situpsSVG from '../../assets/sports-situps.svg';
import russian_twistSVG from '../../assets/sports-russian_twist.svg';
import dipSVG from '../../assets/sports-dip.svg';
import legRaisesSVG from '../../assets/sports-leg_raises.svg';
import lungesSVG from '../../assets/sports-lunges.svg';

export const sportIconMap: Record<string, string> = {
  pushup: pushupSVG,
  plank: plankSVG,
  pilates: pilatesSVG,
  squats: squatsSVG,
  situps: situpsSVG,
  russian_twist: russian_twistSVG,
  dip: dipSVG,
  leg_raises: legRaisesSVG,
  lunges: lungesSVG,
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
