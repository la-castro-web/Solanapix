import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
  leftLabel?: string
  rightLabel?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, className, leftLabel, rightLabel, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-3">
        {leftLabel && (
          <span className={`text-sm font-medium transition-colors ${
            !checked ? 'text-gray-900' : 'text-gray-400'
          }`}>
            {leftLabel}
          </span>
        )}
        
        <button
          ref={ref}
          role="switch"
          aria-checked={checked}
          onClick={() => onCheckedChange(!checked)}
          className={cn(
            "relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "bg-[#00BFA6]" : "bg-gray-200",
            className
          )}
          {...props}
        >
          <span
            className={cn(
              "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg ring-0 transition-transform",
              checked ? "translate-x-8" : "translate-x-1"
            )}
          />
        </button>
        
        {rightLabel && (
          <span className={`text-sm font-medium transition-colors ${
            checked ? 'text-gray-900' : 'text-gray-400'
          }`}>
            {rightLabel}
          </span>
        )}
      </div>
    )
  }
)
Switch.displayName = "Switch"

export { Switch } 