import "./styles.css";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { initFunnelOrchestrator } from "./orchestrator";

gsap.registerPlugin(ScrollTrigger);

// ScrollTrigger deve rimisurare dopo il caricamento dei font: i clamp e lo switch
// di famiglia tipografica tra le due epoche cambiano gli offset di layout.
const start = () => initFunnelOrchestrator();

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    start();
    ScrollTrigger.refresh();
  });
} else {
  start();
}

window.addEventListener("load", () => ScrollTrigger.refresh());
