'use client';

import * as React from "react";
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
    type ToastProps,
    type ToastActionElement,
} from "@/components/ui/toast";

// ─── State Store ─────────────────────────────────────────────────────────────

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 4000;

type ToasterToast = ToastProps & {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: ToastActionElement;
};

type State = { toasts: ToasterToast[] };

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(toasts: ToasterToast[]) {
    memoryState = { toasts };
    listeners.forEach((l) => l(memoryState));
}

function toast(props: Omit<ToasterToast, "id">) {
    const id = Math.random().toString(36).slice(2);
    const newToast: ToasterToast = { ...props, id };
    const next = [newToast, ...memoryState.toasts].slice(0, TOAST_LIMIT);
    dispatch(next);
    setTimeout(() => dismiss(id), TOAST_REMOVE_DELAY);
    return { id, dismiss: () => dismiss(id) };
}

function dismiss(id: string) {
    dispatch(memoryState.toasts.filter((t) => t.id !== id));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useToast() {
    const [state, setState] = React.useState<State>(memoryState);
    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) listeners.splice(index, 1);
        };
    }, []);
    return { ...state, toast, dismiss };
}

// ─── Toaster ──────────────────────────────────────────────────────────────────

function Toaster() {
    const { toasts } = useToast();
    return (
        <ToastProvider>
            {toasts.map(({ id, title, description, action, ...props }) => (
                <Toast key={id} {...props}>
                    <div className="grid gap-1">
                        {title && <ToastTitle>{title}</ToastTitle>}
                        {description && <ToastDescription>{description}</ToastDescription>}
                    </div>
                    {action}
                    <ToastClose />
                </Toast>
            ))}
            <ToastViewport />
        </ToastProvider>
    );
}

export { useToast, toast, Toaster };
