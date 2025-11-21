import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { X, ZoomIn, ZoomOut, Maximize2, Check } from "lucide-react";

interface AvatarImagePositionerProps {
  imageUrl: string;
  initialPosition?: { x: number; y: number; scale: number };
  profileName?: string;
  profileTitle?: string;
  onSave: (position: { x: number; y: number; scale: number }) => void;
  onClose: () => void;
}

export function AvatarImagePositioner({
  imageUrl,
  initialPosition = { x: 0, y: 0, scale: 1 },
  profileName,
  profileTitle,
  onSave,
  onClose
}: AvatarImagePositionerProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.controls-area')) return;
    setIsDragging(true);
    // Calculate drag start relative to current position
    // Position is already in the transform context (after scale 0.75)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      ...position,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.controls-area')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    setPosition({
      ...position,
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setPosition({ ...position, scale: Math.min(position.scale + 0.1, 3) });
  };

  const handleZoomOut = () => {
    setPosition({ ...position, scale: Math.max(position.scale - 0.1, 0.5) });
  };

  const handleReset = () => {
    setPosition({ x: 0, y: 0, scale: 1 });
  };

  const handleSave = () => {
    onSave(position);
    onClose();
  };

  // Avatar circle size - responsive: percentage of viewport for easier cropping
  // On mobile: use 70% of viewport width (capped between 250px-350px)
  // On desktop: use 50% of viewport width
  const [avatarSize, setAvatarSize] = useState(120);
  const avatarRadius = avatarSize / 2;
  
  // Calculate responsive avatar size based on screen width
  useEffect(() => {
    const updateAvatarSize = () => {
      const viewportWidth = window.innerWidth;
      const isMobile = viewportWidth < 768; // Tablet and below
      
      if (isMobile) {
        // Mobile: Use 70% of viewport width, but cap between 250px and 350px
        const calculatedSize = Math.min(Math.max(viewportWidth * 0.7, 250), 350);
        setAvatarSize(calculatedSize);
      } else {
        // Desktop: Use 50% of viewport width
        const calculatedSize = viewportWidth * 0.5;
        setAvatarSize(calculatedSize);
      }
    };
    
    updateAvatarSize();
    window.addEventListener('resize', updateAvatarSize);
    return () => window.removeEventListener('resize', updateAvatarSize);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full Image Background - Shows the complete image */}
      {/* Simple structure: full image that can be positioned and scaled */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {imageUrl && (
          <img 
            alt="Avatar crop preview" 
            className="absolute w-full h-full object-contain cursor-move" 
            src={imageUrl}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`,
              transformOrigin: 'center center',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              pointerEvents: 'none'
            }}
            draggable={false}
          />
        )}
      </div>

      {/* Dark Overlay with Circular Crop Window */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dark overlay background */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Circular crop indicator - uses box-shadow to create darkening effect outside circle */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white z-10"
          style={{
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
            boxShadow: `
              0 0 0 9999px rgba(0, 0, 0, 0.7),
              0 0 30px rgba(255, 255, 255, 0.5)
            `
          }}
        >
          {/* Inner crop area highlight */}
          <div className="absolute inset-2 rounded-full border-2 border-white/40" />
        </div>
      </div>

      {/* Helper Overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-2 rounded-full pointer-events-none z-10">
        {isDragging ? "Dragging image..." : "Drag image to reposition | Use zoom controls below"}
      </div>

      {/* Control Buttons - Top Right */}
      <div className="controls-area absolute top-6 right-6 flex flex-col gap-2 pointer-events-auto z-10">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 bg-white/90 hover:bg-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Bottom Controls */}
      <div className="controls-area absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-3 pointer-events-auto z-10">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          disabled={position.scale <= 0.5}
          className="text-white hover:bg-white/20 h-9 px-3"
        >
          <ZoomOut className="w-4 h-4 mr-1" />
          <span className="text-xs">Out</span>
        </Button>
        
        <div className="h-6 w-px bg-white/30" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          disabled={position.scale >= 3}
          className="text-white hover:bg-white/20 h-9 px-3"
        >
          <ZoomIn className="w-4 h-4 mr-1" />
          <span className="text-xs">In</span>
        </Button>
        
        <div className="h-6 w-px bg-white/30" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-white hover:bg-white/20 h-9 px-3"
        >
          <Maximize2 className="w-4 h-4 mr-1" />
          <span className="text-xs">Reset</span>
        </Button>
        
        <div className="h-6 w-px bg-white/30" />
        
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handleSave}
          className="h-9 px-4 bg-[#c96442] hover:bg-[#b55638] text-white"
        >
          <Check className="w-4 h-4 mr-1" />
          <span className="text-xs">Save & Close</span>
        </Button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none z-10">
        {Math.round(position.scale * 100)}%
      </div>
    </div>
  );
}
