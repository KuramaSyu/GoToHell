import { useEffect } from 'react';
import { useThemeStore } from '../../zustand/useThemeStore';
import { useSportStore } from '../../useSportStore';
import { useSportResponseStore } from '../../zustand/sportResponseStore';
import usePreferenceStore from '../../zustand/PreferenceStore';
import { useUsedMultiplierStore } from '../../zustand/usedMultiplierStore';
import useCalculatorStore from '../../zustand/CalculatorStore';
import { buildDecoratorStack } from './SportSelect';

/**
 * Logic-only component that updates the calculator when dependencies change.
 * Doesn't render anything - just manages the side effect.
 */
export const CalculatorUpdater = () => {
  const { theme } = useThemeStore();
  const { currentSport } = useSportStore();
  const { sportResponse } = useSportResponseStore();
  const { preferences } = usePreferenceStore();
  const { usedMultiplier } = useUsedMultiplierStore();
  const { setCalculator } = useCalculatorStore();

  /**
   * updates the DecoratorStack, when:
   *  - game changs
   *  - selected sport changes
   *  - sport response from backend changes
   *  - preferences changes
   *  - usedMultiplier changes
   */
  useEffect(() => {
    setCalculator(
      buildDecoratorStack(sportResponse, preferences, theme.custom.themeName),
    );
  }, [
    theme,
    currentSport,
    sportResponse,
    preferences,
    usedMultiplier,
    setCalculator,
  ]);

  return null;
};
