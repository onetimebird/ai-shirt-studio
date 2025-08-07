interface ScreenPrintBoundingBoxProps {
  tshirtDimensions: {
    top: number;
    scale: number;
    height: number;
  };
  canvasHeight: number;
  canvasWidth: number;
  currentSide: "front" | "back";
}

export const ScreenPrintBoundingBox = ({ 
  tshirtDimensions, 
  canvasHeight, 
  canvasWidth,
  currentSide 
}: ScreenPrintBoundingBoxProps) => {
  console.log('[ScreenPrintBoundingBox] Rendering screen print bounding box for side:', currentSide);
  
  return (
    <>
      {/* Center vertical line - only within shirt area */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.06)) / canvasHeight) * 100}%`,
          width: window.innerWidth >= 768 ? '3px' : '1px',
          height: `${((tshirtDimensions.height * tshirtDimensions.scale * 0.90) / canvasHeight) * 100}%`,
          backgroundColor: '#22c55e',
          transform: 'translateX(-50%)',
          zIndex: 100,
          pointerEvents: 'none',
          opacity: 0.8
        }}
      />
      
      {currentSide === "front" ? (
        <>
          {/* SCREEN-PRINT - Main Adult printable area bounding box */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.20)) / canvasHeight) * 100}%`,
              width: `${(tshirtDimensions.height * tshirtDimensions.scale * 0.42) / canvasWidth * 100}%`,
              height: `${(tshirtDimensions.height * tshirtDimensions.scale * (window.innerWidth < 768 ? 0.55 * 1.15 : 0.55)) / canvasHeight * 100}%`,
              border: window.innerWidth >= 768 ? '3px solid #60a5fa' : '1px solid #60a5fa',
              transform: 'translateX(-50%)',
              zIndex: 99,
              pointerEvents: 'none',
              opacity: 0.8,
              borderRadius: '4px'
            }}
          />
          
          {/* SCREEN-PRINT - Left Chest area box */}
          <div
            style={{
              position: 'absolute',
              left: '60%',
              top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.20)) / canvasHeight) * 100}%`,
              width: `${(tshirtDimensions.height * tshirtDimensions.scale * 0.16) / canvasWidth * 100}%`,
              height: `${(tshirtDimensions.height * tshirtDimensions.scale * (window.innerWidth < 768 ? 0.14 * 1.15 : 0.14)) / canvasHeight * 100}%`,
              border: window.innerWidth >= 768 ? '2px dashed #60a5fa' : '1px dashed #60a5fa',
              transform: 'translateX(-50%)',
              zIndex: 100,
              pointerEvents: 'none',
              opacity: 0.8,
              borderRadius: '3px'
            }}
          />
          
          {/* SCREEN-PRINT - Youth size area indicator */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.23)) / canvasHeight) * 100}%`,
              width: `${(tshirtDimensions.height * tshirtDimensions.scale * 0.38) / canvasWidth * 100}%`,
              height: `${(tshirtDimensions.height * tshirtDimensions.scale * (window.innerWidth < 768 ? 0.40 * 1.15 : 0.40)) / canvasHeight * 100}%`,
              border: window.innerWidth >= 768 ? '2px dashed #60a5fa' : '1px dashed #60a5fa',
              transform: 'translateX(-50%)',
              zIndex: 98,
              pointerEvents: 'none',
              opacity: 0.7,
              borderRadius: '4px'
            }}
          />
          
          {/* SCREEN-PRINT - Left Chest label */}
          <div
            style={{
              position: 'absolute',
              left: '60%',
              top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.18)) / canvasHeight) * 100}%`,
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              color: 'white',
              padding: '1px 4px',
              borderRadius: '8px',
              fontSize: window.innerWidth >= 768 ? '18px' : '7px',
              fontWeight: window.innerWidth >= 768 ? '600' : '400',
              zIndex: 101,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            className="relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] md:px-3 md:py-1 md:min-w-[75px]"
          >
            Left Chest
          </div>
          
          {/* SCREEN-PRINT - Youth label */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.65)) / canvasHeight) * 100}%`,
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              color: 'white',
              padding: '1px 4px',
              borderRadius: '8px',
              fontSize: window.innerWidth >= 768 ? '18px' : '7px',
              fontWeight: window.innerWidth >= 768 ? '600' : '400',
              zIndex: 101,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            className="relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] md:px-3 md:py-1 md:min-w-[75px]"
          >
            Youth
          </div>
          
          {/* SCREEN-PRINT - Adult label */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.72)) / canvasHeight) * 100}%`,
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              color: 'white',
              padding: '1px 4px',
              borderRadius: '8px',
              fontSize: window.innerWidth >= 768 ? '18px' : '7px',
              fontWeight: window.innerWidth >= 768 ? '600' : '400',
              zIndex: 101,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            className="relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] md:px-3 md:py-1 md:min-w-[75px]"
          >
            Adult
          </div>
        </>
      ) : (
        <>
          {/* BACK - Main Adult printable area */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.06)) / canvasHeight) * 100}%`,
              width: `${(tshirtDimensions.height * tshirtDimensions.scale * 0.45) / canvasWidth * 100}%`,
              height: `${(tshirtDimensions.height * tshirtDimensions.scale * (window.innerWidth < 768 ? 0.70 * 1.15 : 0.70)) / canvasHeight * 100}%`,
              border: window.innerWidth >= 768 ? '3px solid #60a5fa' : '1px solid #60a5fa',
              transform: 'translateX(-50%)',
              zIndex: 99,
              pointerEvents: 'none',
              opacity: 0.8,
              borderRadius: '4px'
            }}
          />
          
          {/* BACK - Youth size area indicator */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.16)) / canvasHeight) * 100}%`,
              width: `${(tshirtDimensions.height * tshirtDimensions.scale * 0.38) / canvasWidth * 100}%`,
              height: `${(tshirtDimensions.height * tshirtDimensions.scale * (window.innerWidth < 768 ? 0.35 * 1.15 : 0.35)) / canvasHeight * 100}%`,
              border: window.innerWidth >= 768 ? '2px dashed #60a5fa' : '1px dashed #60a5fa',
              transform: 'translateX(-50%)',
              zIndex: 98,
              pointerEvents: 'none',
              opacity: 0.7,
              borderRadius: '4px'
            }}
          />
          
          {/* BACK - Youth label */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.52)) / canvasHeight) * 100}%`,
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              color: 'white',
              padding: '1px 4px',
              borderRadius: '8px',
              fontSize: window.innerWidth >= 768 ? '18px' : '7px',
              fontWeight: window.innerWidth >= 768 ? '600' : '400',
              zIndex: 101,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            className="relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] md:px-3 md:py-1 md:min-w-[75px]"
          >
            Youth
          </div>
          
          {/* BACK - Adult label */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.78)) / canvasHeight) * 100}%`,
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              color: 'white',
              padding: '1px 4px',
              borderRadius: '8px',
              fontSize: window.innerWidth >= 768 ? '18px' : '7px',
              fontWeight: window.innerWidth >= 768 ? '600' : '400',
              zIndex: 101,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            className="relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] md:px-3 md:py-1 md:min-w-[75px]"
          >
            Adult
          </div>
        </>
      )}
    </>
  );
};