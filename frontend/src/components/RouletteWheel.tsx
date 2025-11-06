import React, { useEffect, useRef } from 'react';
import anime from 'animejs';

interface RouletteWheelProps {
  winningNumber: number | null;
  isSpinning: boolean;
}

// European Roulette wheel layout (0-36) in actual wheel order
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  winningNumber,
  isSpinning,
}) => {
  const wheelRef = useRef<SVGSVGElement>(null);
  const ballContainerRef = useRef<HTMLDivElement>(null);
  const lastNumberRef = useRef<number>(0);

  const totalNumbers = 37;
  const singleRotationDegree = 360 / totalNumbers;
  const spinDuration = 5000;

  const getWheelIndexFromNumber = (number: number): number => {
    return WHEEL_NUMBERS.indexOf(number);
  };

  const getRotationFromNumber = (number: number): number => {
    const index = getWheelIndexFromNumber(number);
    return singleRotationDegree * index;
  };

  const getRandomEndRotation = (minSpins: number, maxSpins: number): number => {
    const spins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
    return 360 * spins;
  };

  const getZeroEndRotation = (totalRotation: number): number => {
    return 360 - Math.abs(totalRotation % 360);
  };

  const getBallEndRotation = (zeroEndRotation: number, currentNumber: number): number => {
    return Math.abs(zeroEndRotation) + getRotationFromNumber(currentNumber);
  };

  const spinWheel = (number: number) => {
    console.log('spinWheel called with number:', number);
    console.log('Wheel ref:', wheelRef.current);
    console.log('Ball container ref:', ballContainerRef.current);
    
    if (!wheelRef.current || !ballContainerRef.current) {
      console.error('Wheel refs not ready!', {
        wheel: !!wheelRef.current,
        ball: !!ballContainerRef.current
      });
      return;
    }

    console.log('Starting spin animation for number:', number);

    const bezier = [0.165, 0.84, 0.44, 1.005];
    const ballMinSpins = 2;
    const ballMaxSpins = 4;
    const wheelMinSpins = 2;
    const wheelMaxSpins = 4;

    const lastNumberRotation = getRotationFromNumber(lastNumberRef.current);
    const endRotation = -getRandomEndRotation(wheelMinSpins, wheelMaxSpins);
    const zeroFromEndRotation = getZeroEndRotation(endRotation);
    const ballEndRotation =
      getRandomEndRotation(ballMinSpins, ballMaxSpins) +
      getBallEndRotation(zeroFromEndRotation, number);

    // Reset wheel to last position
    anime.set(wheelRef.current, {
      rotate: lastNumberRotation,
      transformOrigin: 'center center',
    });

    // Reset ball container
    anime.set(ballContainerRef.current, {
      rotate: 0,
      transformOrigin: 'center center',
    });

    // Animate wheel (counterclockwise)
    anime({
      targets: wheelRef.current,
      rotate: endRotation,
      duration: spinDuration,
      easing: `cubicBezier(${bezier.join(',')})`,
      transformOrigin: 'center center',
      complete: () => {
        console.log('Wheel animation complete');
        lastNumberRef.current = number;
      },
    });

    // Animate ball container
    anime({
      targets: ballContainerRef.current,
      rotate: ballEndRotation,
      duration: spinDuration,
      easing: `cubicBezier(${bezier.join(',')})`,
      transformOrigin: 'center center',
      complete: () => {
        console.log('Ball animation complete');
      },
    });
  };

  useEffect(() => {
    console.log('Wheel useEffect triggered:', { isSpinning, winningNumber, wheelRef: !!wheelRef.current, ballRef: !!ballContainerRef.current });
    if (isSpinning && winningNumber !== null) {
      console.log('Conditions met! Starting wheel spin for number:', winningNumber);
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        console.log('Calling spinWheel function');
        spinWheel(winningNumber);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      console.log('Conditions not met for spin:', { isSpinning, winningNumber });
    }
  }, [isSpinning, winningNumber]);

  const getNumberColor = (num: number): string => {
    if (num === 0) return '#00CC00';
    return RED_NUMBERS.has(num) ? '#CC0000' : '#000000';
  };

  return (
    <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-2xl p-6 shadow-2xl border-4 border-yellow-700">
      <div className="relative w-[380px] h-[380px] mx-auto">
        {/* Wheel SVG */}
        <svg 
          ref={wheelRef}
          width="380" 
          height="380" 
          viewBox="0 0 380 380" 
          className="absolute inset-0"
          style={{ transformOrigin: '190px 190px' }}
        >
            {/* Outer rim */}
            <circle
              cx="190"
              cy="190"
              r="185"
              fill="url(#woodGradient)"
              stroke="#8B4513"
              strokeWidth="3"
            />
            
            {/* Number pockets */}
            {WHEEL_NUMBERS.map((num, index) => {
              const angle = (index * 360) / totalNumbers - 90;
              const angleRad = (angle * Math.PI) / 180;
              const nextAngleRad = ((angle + 360 / totalNumbers) * Math.PI) / 180;
              const innerRadius = 120;
              const outerRadius = 175;

              const x1 = 190 + Math.cos(angleRad) * innerRadius;
              const y1 = 190 + Math.sin(angleRad) * innerRadius;
              const x2 = 190 + Math.cos(nextAngleRad) * innerRadius;
              const y2 = 190 + Math.sin(nextAngleRad) * innerRadius;
              const x3 = 190 + Math.cos(nextAngleRad) * outerRadius;
              const y3 = 190 + Math.sin(nextAngleRad) * outerRadius;
              const x4 = 190 + Math.cos(angleRad) * outerRadius;
              const y4 = 190 + Math.sin(angleRad) * outerRadius;

              const textAngle = angle + 360 / totalNumbers / 2;
              const textAngleRad = (textAngle * Math.PI) / 180;
              const textRadius = 147;
              const textX = 190 + Math.cos(textAngleRad) * textRadius;
              const textY = 190 + Math.sin(textAngleRad) * textRadius;

              return (
                <g key={index}>
                  <path
                    d={`M ${x1},${y1} L ${x2},${y2} L ${x3},${y3} L ${x4},${y4} Z`}
                    fill={getNumberColor(num)}
                    stroke="#FFD700"
                    strokeWidth="1"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                  >
                    {num}
                  </text>
                </g>
              );
            })}

            {/* Center circle */}
            <circle cx="190" cy="190" r="115" fill="url(#centerGradient)" />
            <circle cx="190" cy="190" r="115" fill="none" stroke="#FFD700" strokeWidth="3" />
            
            {/* Gradients */}
            <defs>
              <radialGradient id="woodGradient">
                <stop offset="0%" stopColor="#654321" />
                <stop offset="100%" stopColor="#3E2723" />
              </radialGradient>
              <radialGradient id="centerGradient">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#C5A000" />
                <stop offset="100%" stopColor="#8B7000" />
              </radialGradient>
            </defs>
          </svg>

        {/* Ball container */}
        <div
          ref={ballContainerRef}
          className="absolute inset-0"
          style={{ transformOrigin: '190px 190px' }}
        >
          <div
            className="absolute w-4 h-4 bg-white rounded-full shadow-lg"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -163px)',
              boxShadow: '1px 1px 4px #000, inset 2px 2px 3px rgba(255,255,255,0.8)',
            }}
          />
        </div>

        {/* Pointer */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-yellow-400 shadow-lg" />
      </div>

      {/* Result Display */}
      {winningNumber !== null && !isSpinning && (
        <div className="mt-6 text-center">
          <div className="text-5xl font-bold text-white mb-2">
            {winningNumber}
          </div>
          <div
            className={`text-xl font-semibold ${
              winningNumber === 0
                ? 'text-green-400'
                : RED_NUMBERS.has(winningNumber)
                ? 'text-red-400'
                : 'text-gray-300'
            }`}
          >
            {winningNumber === 0
              ? 'ZERO'
              : RED_NUMBERS.has(winningNumber)
              ? 'RED'
              : 'BLACK'}
          </div>
        </div>
      )}
    </div>
  );
};
