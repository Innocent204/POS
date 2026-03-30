import * as React from "react";
import { cn } from "@/lib/utils";

// Styled to mirror Flutter's InputDecorationTheme:
// - filled surface background
// - 12px border radius (--radius-md)
// - 2px primary border on focus

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn("input-field", className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
