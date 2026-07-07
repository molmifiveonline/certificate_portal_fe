import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils/utils"

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e) => {
        if (onCheckedChange) {
            onCheckedChange(e.target.checked)
        }
    }

    return (
        <div className="relative inline-flex items-center">
            <input
                type="checkbox"
                className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-background checked:bg-primary checked:text-primary-foreground"
                ref={ref}
                onChange={handleChange}
                checked={checked}
                {...props}
            />
            <Check className="absolute h-3 w-3 text-white pointer-events-none hidden peer-checked:block left-0.5" />
        </div>
    )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
