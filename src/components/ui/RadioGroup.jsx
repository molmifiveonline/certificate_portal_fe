import * as React from "react"
import { Circle } from "lucide-react"
import { cn } from "../../lib/utils/utils"

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <div
            className={cn("grid gap-2", className)}
            {...props}
            ref={ref}
        />
    )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <div className="flex items-center space-x-2">
            <div className="relative flex items-center">
                <input
                    type="radio"
                    className={cn(
                        "peer h-4 w-4 shrink-0 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                <Circle className="absolute h-2.5 w-2.5 fill-current text-current pointer-events-none hidden peer-checked:block left-[3px] top-[3px]" />
            </div>
        </div>
    )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
