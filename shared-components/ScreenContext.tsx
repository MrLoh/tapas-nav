import React from 'react';
import { useContext } from 'react';

type ScreenOptions = {
  navType: 'bottom-tabs' | 'sidebar' | 'menu';
  margins: [number, number, number, number];
  buildLink: (name: string, params?: { [key: string]: string | number }) => void;
};
export const ScreenContext = React.createContext<ScreenOptions | null>(null);

export const useScreenContext = () => {
  const options = useContext(ScreenContext);
  if (!options) throw new Error('missing ScreenContext');
  return options;
};

export const ScreenContextProvider = ScreenContext.Provider;
