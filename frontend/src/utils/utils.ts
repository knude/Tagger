import { MouseEvent } from "react";

let token: string = "";

export const setToken = (newToken: string) => {
  token = `Bearer ${newToken}`;
}

export const getToken = (): string => {
  return token;
}

export function handleAnchorClick  (event: MouseEvent<HTMLAnchorElement>) {
  if (event.button === 0) {
    event.currentTarget.removeAttribute('target');
  } else {
    event.currentTarget.setAttribute('target', '_blank');
  }
}
