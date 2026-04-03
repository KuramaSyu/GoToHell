// Feature.tsx
import React, { ReactNode } from 'react';
import useFeatureStore, { FeatureFlagName } from '../zustand/FeatureStore';

interface FeatureProps {
  name: FeatureFlagName; // nur existierende Flags
  children: ReactNode;
  fallback?: ReactNode; // optionaler Fallback
}

export const Feature: React.FC<FeatureProps> = ({
  name,
  children,
  fallback = null,
}) => {
  const flag = useFeatureStore((state) => state.flags[name]);
  return <>{flag.isEnabled() ? children : fallback}</>;
};
