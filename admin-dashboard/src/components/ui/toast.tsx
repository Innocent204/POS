'use client';

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Viewport>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
    <ToastPrimitive.Viewport
        ref={ref}
        className={cn(
            "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[380px]",
            className
        )}
        {...props}
    />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-lg border border-divider p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-slide-in data-[state=closed]:animate-fade-in",
    {
        variants: {
            variant: {
                default: "bg-card text-text-primary",
                success: "bg-success/5 text-success border-success/20",
                warning: "bg-warning/5 text-warning border-warning/20",
                destructive: "bg-error/5 text-error border-error/20",
                info: "bg-info/5 text-info border-info/20",
            },
        },
        defaultVariants: { variant: "default" },
    }
);

const Toast = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
    <ToastPrimitive.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
    />
));
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastAction = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Action>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
    <ToastPrimitive.Action
        ref={ref}
        className={cn(
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-divider bg-transparent px-3 text-sm font-medium text-primary transition-colors hover:bg-surface focus:outline-none focus:ring-1 focus:ring-ring",
            className
        )}
        {...props}
    />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

const ToastClose = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Close>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
    <ToastPrimitive.Close
        ref={ref}
        className={cn(
            "absolute right-2 top-2 rounded p-1 text-text-secondary opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring",
            className
        )}
        {...props}
    >
        <XMarkIcon className="h-4 w-4" />
    </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

const ToastTitle = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
    <ToastPrimitive.Title
        ref={ref}
        className={cn("text-sm font-semibold", className)}
        {...props}
    />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
    <ToastPrimitive.Description
        ref={ref}
        className={cn("text-sm text-text-secondary", className)}
        {...props}
    />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
    type ToastProps,
    type ToastActionElement,
    ToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose,
    ToastAction,
};
