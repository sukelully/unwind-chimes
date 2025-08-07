import { Chime } from '@/models/Chime';
import { Clapper } from '@/models/Clapper';
import { useCallback } from 'react';
import { type Weather } from '@/types/weather';
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
        console.log(level);

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
    const frequency = map(speed, 0, 30, 0.5, 1);
    const dampening = 1.0;

    return { dampening, turbulence, frequency };
  }, [weather.windspeed]);

  // Apply a gust of wind to the clapper
  const applyGust = useCallback(() => {
    if (!weather.windspeed) return;

    const { turbulence } = getWeatherMultipliers();
    const direction = weather.winddir ?? Math.random() * 360;

    // Gust strength varies from 1.5x to 3x base wind speed, modified by turbulence
    const gustMultiplier = (1 + Math.random()) * turbulence * 0.4;
    const gustSpeed = Math.min(weather.windspeed * gustMultiplier, 20);

    // Directional variation - more variation with higher turbulence
    const maxVariation = 180 * turbulence;
    const dirVariation = (Math.random() - 0.5) * maxVariation;
    const gustDirection = direction + dirVariation;
    const gustRadians = ((gustDirection - 90) * Math.PI) / 180;

    const gustForceX = Math.cos(gustRadians) * gustSpeed * 0.3;
    const gustForceY = Math.sin(gustRadians) * gustSpeed * 0.3;

    // Apply to clapper with intensity variation based on turbulence
    const intensity = 0.8 + Math.random() * 0.01 * gustSpeed * turbulence;

    // console.log(`gustSpeed: ${gustSpeed}\nintensity: ${intensity}`);

    clapper?.applyForce(gustForceX * intensity, gustForceY * intensity);
  }, [clapper, weather.windspeed, weather.winddir, getWeatherMultipliers]);

  // Continuous weather effects
  const applyContinuousWeather = useCallback(() => {
    if (!weather.windspeed || weather.windspeed < 1) return;

    const { dampening, turbulence, frequency } = getWeatherMultipliers();
    const direction = weather.winddir ?? 0;
    const speed = Math.min(weather.windspeed, 30);
    const windRadians = ((direction - 90) * Math.PI) / 180;

    // Base continuous wind force
    const baseForceX = Math.cos(windRadians) * speed * 0.001;
    const baseForceY = Math.sin(windRadians) * speed * 0.001;

    // Add turbulence to the continuous wind
    const turbulenceX = (Math.random() - 0.5) * turbulence * 0.3;
    const turbulenceY = (Math.random() - 0.5) * turbulence * 0.3;

    // Apply to clapper with dampening and natural variation
    const variation = 0.8 + Math.random() * 0.4;
    clapper?.applyForce(
      ((baseForceX + turbulenceX) * variation) / dampening,
      ((baseForceY + turbulenceY) * variation) / dampening
    );

    // console.log(
    //   `turbulence: ${turbulence}\ndampening: ${dampening}\nfrequency: ${frequency}\nwindspeed: ${speed}`
    // );

    // Occasional stronger gusts
    const gustProbability = 0.01 * turbulence * frequency;
    if (Math.random() < gustProbability) {
      applyGust();
    }
  }, [clapper, weather, applyGust, getWeatherMultipliers]);

  return { handleCollisions, applyContinuousWeather };
};

export default usePhysics;
