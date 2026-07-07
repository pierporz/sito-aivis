import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/scenes.css";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { initOrchestrator } from "./lib/scrollOrchestrator";

gsap.registerPlugin(ScrollTrigger);

// ScrollTrigger deve rimisurare dopo il caricamento dei font (i clamp cambiano gli offset)
const start = () => initOrchestrator();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    start();
    ScrollTrigger.refresh();
  });
} else {
  start();
}

window.addEventListener("load", () => ScrollTrigger.refresh());
