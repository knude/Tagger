import { MouseEvent } from "react";

let token: string = "";

export const setToken = (newToken: string) => {
  token = `Bearer ${newToken}`;
}

export const getToken = (): string => {
  return token;
}