import { MouseEvent } from "react";

export function handleAnchorClick  (event: MouseEvent<HTMLAnchorElement>) {
  if (event.button === 0) {
    event.currentTarget.removeAttribute('target');
  } else {
    event.currentTarget.setAttribute('target', '_blank');
  }
}
