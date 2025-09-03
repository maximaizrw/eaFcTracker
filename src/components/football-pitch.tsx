
import * as React from "react"
import { cn } from "@/lib/utils"

export interface FootballPitchProps extends React.HTMLAttributes<HTMLDivElement> {}

const FootballPitch = React.forwardRef<HTMLDivElement, FootballPitchProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
            "relative w-full aspect-[4/3] sm:aspect-video rounded-lg overflow-hidden bg-green-600/10 border-2 border-primary/20",
            className
        )}
        {...props}
      >
        {/* Pitch Background SVG */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
            <defs>
                <radialGradient id="pitchGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                    <stop offset="0%" style={{stopColor: 'hsl(var(--primary)/0.08)', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor: 'hsl(var(--primary)/0.01)', stopOpacity:1}} />
                </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#pitchGradient)" />
        </svg>

        {/* Field Markings */}
        <div className="absolute inset-0 pointer-events-none border-[3px] border-white/10 m-2 md:m-4 rounded-md">
            {/* Center Line */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/10" />
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[18%] aspect-square rounded-full border-2 border-white/10" />
            {/* Center Spot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/20 rounded-full" />
            
            {/* Top Penalty Box */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[18%] w-[45%] border-b-2 border-x-2 border-white/10 rounded-b-lg" />
            {/* Top Goal Area */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[8%] w-[25%] border-b-2 border-x-2 border-white/10 rounded-b-md" />
            {/* Top Penalty Spot */}
             <div className="absolute top-[12%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/20 rounded-full" />
            {/* Top Arc */}
            <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[15%] aspect-[2/1] border-b-2 border-white/10 rounded-b-full -mt-[1px]" />
            
            {/* Bottom Penalty Box */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[18%] w-[45%] border-t-2 border-x-2 border-white/10 rounded-t-lg" />
            {/* Bottom Goal Area */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[8%] w-[25%] border-t-2 border-x-2 border-white/10 rounded-t-md" />
            {/* Bottom Penalty Spot */}
            <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/20 rounded-full" />
            {/* Bottom Arc */}
             <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-[15%] aspect-[2/1] border-t-2 border-white/10 rounded-t-full -mb-[1px]" />
        </div>
        
        {/* Children (Player tokens) */}
        <div className="relative w-full h-full">
            {children}
        </div>
      </div>
    );
  }
);
FootballPitch.displayName = "FootballPitch";

export { FootballPitch };
