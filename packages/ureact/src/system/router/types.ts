import React from 'react';

export interface RouteLocation {
  pathname: string;
  search: string;
  hash: string;
  fullPath: string;
}

export interface NavigateOptions {
  replace?: boolean;
  scroll?: boolean;
}

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  replace?: boolean;
  scroll?: boolean;
  activeClassName?: string;
}

export interface RouterContextValue extends RouteLocation {
  navigate: (to: string, options?: NavigateOptions) => void;
  back: () => void;
  forward: () => void;
}
