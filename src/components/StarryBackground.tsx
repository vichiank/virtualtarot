import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

const CONSTELLATIONS = [
  {
    name: 'Aries',
    stars: [{x: 20, y: 30}, {x: 25, y: 25}, {x: 35, y: 30}, {x: 40, y: 40}],
    lines: [[0, 1], [1, 2], [2, 3]]
  },
  {
    name: 'Big Dipper',
    stars: [{x: 60, y: 20}, {x: 65, y: 25}, {x: 70, y: 28}, {x: 75, y: 35}, {x: 85, y: 35}, {x: 88, y: 45}, {x: 78, y: 45}, {x: 75, y: 35}],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]]
  },
  {
    name: 'Cassiopeia',
    stars: [{x: 10, y: 60}, {x: 15, y: 75}, {x: 22, y: 65}, {x: 30, y: 78}, {x: 35, y: 62}],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]]
  },
  {
    name: 'Orion',
    stars: [{x: 50, y: 60}, {x: 60, y: 60}, {x: 55, y: 70}, {x: 52, y: 80}, {x: 58, y: 80}, {x: 50, y: 90}, {x: 60, y: 90}],
    lines: [[0, 2], [1, 2], [2, 3], [2, 4], [3, 5], [4, 6], [3, 4]]
  }
];

export default function StarryBackground() {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);
  const [meteors, setMeteors] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [currentConstellation, setCurrentConstellation] = useState(0);

  useEffect(() => {
    // Generate static twinkle stars
    const newStars = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2
    }));
    setStars(newStars);

    // Generate meteors interval
    const meteorInterval = setInterval(() => {
      const newMeteor = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 50,
        delay: Math.random() * 5
      };
      setMeteors(prev => [...prev.slice(-5), newMeteor]);
    }, 6000);

    // Rotate constellations
    const constellationInterval = setInterval(() => {
      setCurrentConstellation(prev => (prev + 1) % CONSTELLATIONS.length);
    }, 8000);

    return () => {
      clearInterval(meteorInterval);
      clearInterval(constellationInterval);
    };
  }, []);

  const constellation = CONSTELLATIONS[currentConstellation];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Background Twinkle Stars */}
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Constellation Lines */}
      <AnimatePresence mode="wait">
        <motion.div
          key={constellation.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <svg className="w-full h-full opacity-20">
            {constellation.lines.map((line, idx) => {
              const start = constellation.stars[line[0]];
              const end = constellation.stars[line[1]];
              return (
                <motion.line
                  key={idx}
                  x1={`${start.x}%`}
                  y1={`${start.y}%`}
                  x2={`${end.x}%`}
                  y2={`${end.y}%`}
                  stroke="white"
                  strokeWidth="0.5"
                  strokeDasharray="4 2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, delay: 0.5 }}
                />
              );
            })}
            {constellation.stars.map((star, idx) => (
              <circle
                key={idx}
                cx={`${star.x}%`}
                cy={`${star.y}%`}
                r="1.5"
                fill="white"
                className="shadow-[0_0_8px_rgba(255,255,255,1)]"
              />
            ))}
          </svg>
        </motion.div>
      </AnimatePresence>

      {/* Meteors (Shooting Stars) */}
      {meteors.map(meteor => (
        <motion.div
          key={meteor.id}
          className="absolute w-[2px] h-[250px] bg-gradient-to-t from-white to-transparent rotate-[75deg] opacity-0"
          style={{
            left: `${meteor.x}%`,
            top: `${meteor.y}%`,
          }}
          animate={{
            x: [0, -350],
            y: [-250, 950],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
