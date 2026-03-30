import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Badge variants matching Flutter's status chip patterns (AppColors semantic palette)
const badgeVariants = cva(
    "badge",
    {
        variants: {
            variant: {
                default: "badge-default",
                success: "badge-success",
                warning: "badge-warning",
                error: "badge-error",
                info: "badge-info",
                // Stock-specific (maps to same colours)
                "in-stock": "stock-in badge",
                "low-stock": "stock-low badge",
                "out-stock": "stock-out badge",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
