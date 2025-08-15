import { Chime } from '@/models/Chime';
import { Clapper } from '@/models/Clapper';
import { useCallback } from 'react';
import type { Weather } from '@/types/weather';
import { map } from '@/utils/math';

const usePhysics = (chimes: Chime[], clapper: Clapper | null, weather: Weather) => {
  // Determine whether a collision has occured and play chime if so
  const handleCollisions = useCallback(() => {
    if (!clapper || !chimes) return;

    chimes.forEach((chime: Chime) => {
      const dx = clapper.x - chime.x;
      const dy = clapper.y - chime.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = clapper.r + chime.r;

      // Collision occurs
      if (distance < minDistance && distance > 0) {
        const overlap = minDistance - distance;
        const separationX = (dx / distance) * overlap * 0.5;
        const separationY = (dy / distance) * overlap * 0.5;

        // Calculate velocity for volume level
        const velX = clapper.velocityX - chime.velocityX;
        const velY = clapper.velocityY - chime.velocityY;
        const collisionSpeed = Math.sqrt(velX * velX + velY * velY);

        // Convert to volume level
        const volumeLimit = 0.3;
        const level = Math.min(collisionSpeed * 0.05, volumeLimit);
        // console.log(level);

        // Separate objects
        clapper.x += separationX;
        clapper.y += separationY;
        chime.x -= separationX;
        chime.y -= separationY;

        // Apply bounce forces
        clapper.applyForce(separationX * clapper.bounceForce, separationY * clapper.bounceForce);
        chime.applyForce(-separationX * chime.bounceForce, -separationY * chime.bounceForce);

        if (!chime.isColliding) {
          chime.playChime(level);
          chime.isColliding = true;
          chime.collisionCooldown = 30;
        }
      }
    });
  }, [chimes, clapper]);

  // Use weather conditions to modify existing weather variables
  const getWeatherMultipliers = useCallback(() => {
    const speed = Math.min(weather.windspeed, 30);

    const turbulence = map(speed, 0, 30, 1, 1.5);
    const frequency = map(speed, 0, 30, 0.8, 1);
    const dampening = 1.0;

    return { dampening, turbulence, frequency };
  }, [weather.windspeed]);

  // Apply a gust of wind to the clapper
  const applyGust = useCallback(() => {
    if (!weather.windspeed) return;

    const { turbulence } = getWeatherMultipliers();
    const direction = weather.winddir ?? Math.random() * 360;

    const gustMultiplier = (1 + Math.random()) * turbulence * 0.4;
    const gustSpeed = Math.min(weather.windspeed * gustMultiplier, 20);

    // Higher turbulence means greater variation
    const maxVariation = 180 * turbulence;
    const dirVariation = (Math.random() - 0.5) * maxVariation;
    const gustDirection = direction + 180 + dirVariation;

    const gustRadians = (gustDirection * Math.PI) / 180;

    const gustForceX = Math.cos(gustRadians) * gustSpeed * 0.3;
    const gustForceY = Math.sin(gustRadians) * gustSpeed * 0.3;

    // Apply to clapper with inensity variation based on turbulence
    const intensity = 0.8 + Math.random() * 0.01 * gustSpeed * turbulence;

    clapper?.applyForce(gustForceX * intensity, gustForceY * intensity);
  }, [clapper, weather.windspeed, weather.winddir, getWeatherMultipliers]);

  // Continuous weather effects
  const applyContinuousWeather = useCallback(() => {
    if (!weather.windspeed) return;

    const { dampening, turbulence, frequency } = getWeatherMultipliers();

    const towardDirection = (weather.winddir ?? 0) + 180;
    const windRadians = (towardDirection * Math.PI) / 180;
    let speed = Math.min(weather.windspeed, 30);

    if (speed < 3) {
      speed = 3;
    } else if (speed < 6) {
      speed = 5.9;
    }

    const baseForceX = Math.cos(windRadians) * speed * 0.001;
    const baseForceY = Math.sin(windRadians) * speed * 0.001;

    const turbulenceX = (Math.random() - 0.5) * turbulence * 0.3;
    const turbulenceY = (Math.random() - 0.5) * turbulence * 0.3;

    const variation = 0.8 + Math.random() * 0.4;

    // Apply final force to clapper
    clapper?.applyForce(
      ((baseForceX + turbulenceX) * variation) / dampening,
      ((baseForceY + turbulenceY) * variation) / dampening
    );

    const gustProbability = 0.01 * turbulence * frequency;
    if (Math.random() < gustProbability) {
      applyGust();
    }
  }, [clapper, weather, getWeatherMultipliers, applyGust]);

  return { handleCollisions, applyContinuousWeather };
};

export default usePhysics;
