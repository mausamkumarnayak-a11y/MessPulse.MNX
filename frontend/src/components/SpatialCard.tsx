import React, { useRef } from 'react';

interface SpatialCardProps {
  children: React.ReactNode;
  className?: string;
  float?: 'float-a' | 'float-b' | 'float-c' | 'none';
  id?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const SpatialCard: React.FC<SpatialCardProps> = ({
  children,
  className = '',
  float = 'none',
  id,
  onClick,
  style
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(6px)`;
  };

  const handlePointerLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)`;
  };

  const isHFull = className.includes('h-full');
  const containerClass = `${float === 'none' ? '' : float} ${isHFull ? 'h-full' : ''}`.trim();

  // If no explicit padding utility is provided, apply default spacious padding
  const hasPaddingClass = /\bp-[0-9]|\bpx-|\bpy-/.test(className);
  const defaultPadding = hasPaddingClass ? '' : 'p-6';

  return (
    <div
      id={id}
      className={containerClass}
      style={{
        ...style,
        height: isHFull ? '100%' : style?.height,
        display: isHFull ? 'flex' : undefined,
        flexDirection: isHFull ? 'column' : undefined
      }}
    >
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={onClick}
        className={`mirror sheen transition-transform duration-200 ease-out ${defaultPadding} ${className}`}
        style={{
          cursor: onClick ? 'pointer' : 'default',
          height: isHFull ? '100%' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        <div className="spatial-card-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

