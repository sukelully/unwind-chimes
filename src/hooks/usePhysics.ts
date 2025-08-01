import { Chime } from '../models/Chime';
import { Clapper } from '../models/Clapper';
import { useCallback } from 'react';
import { type Weather } from '../types/weather';

const usePhysics = (chimes: Chime[], clapper: Clapper | null, weather: Weather) => {
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
        const level = Math.min(collisionSpeed * 0.1, 0.8);

        // Separate objects
        clapper.x += separationX;
        clapper.y += separationY;
        chime.x -= separationX;
        chime.y -= separationY;

        // Apply bounce forces
        const bounceForce = 0.3;
        clapper.applyForce(separationX * bounceForce, separationY * bounceForce);
        chime.applyForce(-separationX * bounceForce, -separationY * bounceForce);

        if (!chime.isColliding) {
          chime.playSimpleChime(chime.freq, 5, level);
          chime.isColliding = true;
          chime.collisionCooldown = 30;
        }
      }
    });
  }, [chimes, clapper]);

  const getWeatherMultipliers = useCallback(() => {
    const condition = weather.conditions?.toLowerCase() || '';

    let dampening = 1.0;
    let turbulence = 1.0;
    let frequency = 1.0;

    if (condition.includes('rain')) {
      dampening = 1.3; // Rain adds weight/dampening
      turbulence = 0.5; // Less chaotic movement
      frequency = 0.5;
    }

    if (condition.includes('storm') || condition.includes('heavy')) {
      turbulence = 2.0; // Much more chaotic
      frequency = 1; // More frequent gusts
    }

    if (condition.includes('calm') || weather.windspeed < 3) {
      dampening = 0.8; // Less resistance
      turbulence = 0.3; // Very gentle movement
      frequency = 0.1; // Less frequent activity
    }

    return { dampening, turbulence, frequency };
  }, [weather.conditions, weather.windspeed]);

  const applyGust = useCallback(() => {
    if (!weather.windspeed) return;

    const { turbulence } = getWeatherMultipliers();
    const direction = weather.winddir ?? Math.random() * 360;

    // Gust strength varies from 1.5x to 3x base wind speed, modified by turbulence
    const gustMultiplier = (1.5 + Math.random() * 1.5) * turbulence;
    const gustSpeed = weather.windspeed * gustMultiplier;

    // Directional variation - more variation with higher turbulence
    const maxVariation = 120 * turbulence; // Up to 60 degrees in calm, 120 in storms
    const dirVariation = (Math.random() - 0.5) * maxVariation;
    const gustDirection = direction + dirVariation;
    const gustRadians = ((gustDirection - 90) * Math.PI) / 180;

    const gustForceX = Math.cos(gustRadians) * gustSpeed * 0.3;
    const gustForceY = Math.sin(gustRadians) * gustSpeed * 0.3;

    // Apply to clapper with intensity variation based on turbulence
    const intensity = 0.8 + Math.random() * 0.4 * turbulence;
    clapper?.applyForce(gustForceX * intensity, gustForceY * intensity);
  }, [clapper, weather.windspeed, weather.winddir, getWeatherMultipliers]);

  const applyContinuousWeather = useCallback(() => {
    if (!weather.windspeed || weather.windspeed < 1) return;

    const { dampening, turbulence, frequency } = getWeatherMultipliers();
    const direction = weather.winddir ?? 0;
    const speed = weather.windspeed;
    const windRadians = ((direction - 90) * Math.PI) / 180;

    // Base continuous wind force
    const baseForceX = Math.cos(windRadians) * speed * 0.015;
    const baseForceY = Math.sin(windRadians) * speed * 0.015;

    // Add turbulence to the continuous wind
    const turbulenceX = (Math.random() - 0.5) * speed * turbulence * 0.01;
    const turbulenceY = (Math.random() - 0.5) * speed * turbulence * 0.01;

    // Apply to clapper with dampening and natural variation
    const variation = 0.8 + Math.random() * 0.4;
    clapper?.applyForce(
      ((baseForceX + turbulenceX) * variation) / dampening,
      ((baseForceY + turbulenceY) * variation) / dampening
    );

    // Occasional stronger gusts - frequency affects probability
    const gustProbability = 0.002 * speed * frequency;
    if (Math.random() < gustProbability) {
      applyGust();
    }
  }, [clapper, weather, applyGust, getWeatherMultipliers]);

  return { handleCollisions, applyContinuousWeather };
};

export default usePhysics;
