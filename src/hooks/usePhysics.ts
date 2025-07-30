import { Chime } from "../models/Chime";
import { Clapper } from "../models/Clapper";
import { useCallback } from "react";

const usePhysics = (chimes: Chime[], clapper: Clapper | null) => {
  const handleCollisions = useCallback(() => {
    if (!clapper) return;

    chimes.forEach((chime: Chime) => {
      const dx = clapper.x - chime.x;
      const dy = clapper.y - chime.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = clapper.r + chime.r;

      if (distance < minDistance && distance > 0) {
        // Collision physics
        const overlap = minDistance - distance;
        const separationX = (dx / distance) * overlap * 0.5;
        const separationY = (dy / distance) * overlap * 0.5;

        // Separate objects
        clapper.x += separationX;
        clapper.y += separationY;
        chime.x -= separationX;
        chime.y -= separationY;

        // Apply bounce forces
        const bounceForce = 0.3;
        clapper.applyForce(separationX * bounceForce, separationY * bounceForce);
        chime.applyForce(-separationX * bounceForce, -separationY * bounceForce);

        // Play sound
        chime.playSimpleChime(chime.freq);
      }
    });
  }, [chimes, clapper]);

  const applyRandomBreeze = useCallback(() => {
    if (Math.random() < 0.005) {
      const allObjects = [...chimes, clapper].filter(Boolean);
      const randomObject = allObjects[Math.floor(Math.random() * allObjects.length)];
      if (randomObject) {
        randomObject.applyBreeze(0.15);
      }
    }
  }, [chimes, clapper]);

  return { handleCollisions, applyRandomBreeze };
};

export default usePhysics;