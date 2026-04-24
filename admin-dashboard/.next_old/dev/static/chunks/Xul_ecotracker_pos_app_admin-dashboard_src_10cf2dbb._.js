(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Xul/ecotracker_pos_app/admin-dashboard/src/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])(// Base — matches Flutter's ElevatedButton shape and font
"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
    variants: {
        variant: {
            // Primary — #1565C0 bg, white text (matches Flutter ElevatedButton light)
            default: "bg-primary text-white shadow-sm hover:bg-primary-light active:scale-[0.97]",
            // Destructive — error red
            destructive: "bg-error text-white shadow-sm hover:bg-error/90 active:scale-[0.97]",
            // Outline — transparent with primary border (matches Flutter OutlinedButton)
            outline: "border border-primary bg-transparent text-primary hover:bg-primary hover:text-white active:scale-[0.97]",
            // Secondary — surface bg with text-primary
            secondary: "bg-surface text-text-primary border border-divider shadow-sm hover:bg-muted active:scale-[0.97]",
            // Ghost — no bg, text-secondary on hover
            ghost: "hover:bg-surface hover:text-primary text-text-secondary",
            // Link
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-11 px-6 py-3.5",
            sm: "h-9 rounded-md px-3 text-sm",
            lg: "h-12 rounded-lg px-8 text-base",
            icon: "h-10 w-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, variant, size, asChild = false, ...props }, ref)=>{
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/components/ui/button.tsx",
        lineNumber: 55,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Button;
Button.displayName = "Button";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$React.forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Xul/ecotracker_pos_app/admin-dashboard/src/components/ui/input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, type, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("input-field", className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/components/ui/input.tsx",
        lineNumber: 15,
        columnNumber: 13
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Input;
Input.displayName = "Input";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Input$React.forwardRef");
__turbopack_context__.k.register(_c1, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Xul/ecotracker_pos_app/admin-dashboard/src/components/ui/label.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/@radix-ui/react-label/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const Label = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm font-medium text-text-primary leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/components/ui/label.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Label;
Label.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Label$React.forwardRef");
__turbopack_context__.k.register(_c1, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Xul/ecotracker_pos_app/admin-dashboard/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api,
    "apiClient",
    ()=>apiClient,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
const API_BASE_URL = '/api';
const apiClient = __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});
apiClient.interceptors.request.use((config)=>{
    if ("TURBOPACK compile-time truthy", 1) {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error)=>Promise.reject(error));
apiClient.interceptors.response.use((response)=>response, async (error)=>{
    if (error.response?.status === 401 && ("TURBOPACK compile-time value", "object") !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
const api = {
    auth: {
        login: (data)=>apiClient.post('/auth/login', data).then((res)=>res.data)
    },
    dashboard: {
        getSummary: ()=>apiClient.get('/dashboard/summary').then((res)=>res.data),
        getAlerts: ()=>apiClient.get('/dashboard/alerts').then((res)=>res.data),
        getTopProducts: (params)=>apiClient.get('/dashboard/top-products', {
                params
            }).then((res)=>res.data),
        getBranchComparison: ()=>apiClient.get('/dashboard/branch-comparison').then((res)=>res.data)
    },
    products: {
        getAll: (params)=>apiClient.get('/products', {
                params
            }).then((res)=>res.data),
        getById: (id)=>apiClient.get(`/products/${id}`).then((res)=>res.data),
        create: (data)=>apiClient.post('/products', data).then((res)=>res.data),
        update: (id, data)=>apiClient.put(`/products/${id}`, data).then((res)=>res.data),
        delete: (id)=>apiClient.delete(`/products/${id}`).then((res)=>res.data)
    },
    branches: {
        getAll: (params)=>apiClient.get('/branches', {
                params
            }).then((res)=>res.data),
        getById: (id)=>apiClient.get(`/branches/${id}`).then((res)=>res.data),
        create: (data)=>apiClient.post('/branches', data).then((res)=>res.data),
        update: (id, data)=>apiClient.put(`/branches/${id}`, data).then((res)=>res.data),
        delete: (id)=>apiClient.delete(`/branches/${id}`).then((res)=>res.data)
    },
    stock: {
        getByBranch: (branchId)=>apiClient.get(`/stock/branch/${branchId}`).then((res)=>res.data),
        getByProduct: (productId)=>apiClient.get(`/stock/product/${productId}`).then((res)=>res.data),
        adjust: (data)=>apiClient.post('/stock/adjust', data).then((res)=>res.data),
        initialize: (params)=>apiClient.post('/stock/initialize', null, {
                params
            }).then((res)=>res.data),
        getLowStock: ()=>apiClient.get('/stock/low-stock').then((res)=>res.data),
        getOutOfStock: ()=>apiClient.get('/stock/out-of-stock').then((res)=>res.data)
    },
    sales: {
        getAll: (params)=>apiClient.get('/sales', {
                params
            }).then((res)=>res.data),
        getById: (id)=>apiClient.get(`/sales/${id}`).then((res)=>res.data),
        getByReceipt: (receiptNumber)=>apiClient.get(`/sales/receipt/${receiptNumber}`).then((res)=>res.data),
        getReturns: (id)=>apiClient.get(`/sales/${id}/returns`).then((res)=>res.data),
        create: (data)=>apiClient.post('/sales', data).then((res)=>res.data)
    },
    transfers: {
        getAll: (params)=>apiClient.get('/transfers', {
                params
            }).then((res)=>res.data),
        getById: (id)=>apiClient.get(`/transfers/${id}`).then((res)=>res.data),
        create: (data)=>apiClient.post('/transfers', data).then((res)=>res.data),
        dispatch: (id)=>apiClient.put(`/transfers/${id}/dispatch`).then((res)=>res.data),
        receive: (id, data)=>apiClient.put(`/transfers/${id}/receive`, data).then((res)=>res.data),
        cancel: (id)=>apiClient.put(`/transfers/${id}/cancel`).then((res)=>res.data)
    },
    reports: {
        getStockSnapshot: (params)=>apiClient.get('/reports/stock-snapshot', {
                params
            }).then((res)=>res.data),
        getLowStock: (params)=>apiClient.get('/reports/low-stock', {
                params
            }).then((res)=>res.data),
        getSalesReport: (params)=>apiClient.get('/sales', {
                params: {
                    ...params,
                    size: 500
                }
            }).then((res)=>{
                const apiRes = res.data;
                if (apiRes.success && apiRes.data) {
                    return {
                        ...apiRes,
                        data: apiRes.data.content || []
                    };
                }
                return apiRes;
            })
    },
    users: {
        getAll: ()=>apiClient.get('/users').then((res)=>res.data),
        getById: (id)=>apiClient.get(`/users/${id}`).then((res)=>res.data),
        create: (data)=>apiClient.post('/users', data).then((res)=>res.data),
        delete: (id)=>apiClient.delete(`/users/${id}`).then((res)=>res.data)
    },
    audit: {
        getLogs: (params)=>apiClient.get('/audit/logs', {
                params
            }).then((res)=>res.data)
    }
};
const __TURBOPACK__default__export__ = api;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$LockClosedIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockClosedIcon$3e$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/@heroicons/react/24/outline/esm/LockClosedIcon.js [app-client] (ecmascript) <export default as LockClosedIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$EnvelopeIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EnvelopeIcon$3e$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/@heroicons/react/24/outline/esm/EnvelopeIcon.js [app-client] (ecmascript) <export default as EnvelopeIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$EyeIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeIcon$3e$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/@heroicons/react/24/outline/esm/EyeIcon.js [app-client] (ecmascript) <export default as EyeIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$EyeSlashIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeSlashIcon$3e$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/@heroicons/react/24/outline/esm/EyeSlashIcon.js [app-client] (ecmascript) <export default as EyeSlashIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowRightOnRectangleIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRightOnRectangleIcon$3e$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/@heroicons/react/24/outline/esm/ArrowRightOnRectangleIcon.js [app-client] (ecmascript) <export default as ArrowRightOnRectangleIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CubeIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CubeIcon$3e$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/node_modules/@heroicons/react/24/outline/esm/CubeIcon.js [app-client] (ecmascript) <export default as CubeIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/src/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/src/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Xul/ecotracker_pos_app/admin-dashboard/src/lib/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
function LoginPage() {
    _s();
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showPassword, setShowPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    // For entrance animation and auth check
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LoginPage.useEffect": ()=>{
            setMounted(true);
            const token = localStorage.getItem('access_token');
            if (token) {
                router.replace('/dashboard');
            }
        }
    }["LoginPage.useEffect"], [
        router
    ]);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].auth.login({
                email,
                password
            });
            if (response.success && response.data) {
                const { accessToken, refreshToken, fullName, role } = response.data;
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', refreshToken);
                localStorage.setItem('user_name', fullName);
                localStorage.setItem('user_role', role);
                // Set cookie for middleware
                document.cookie = `access_token=${accessToken}; path=/; max-age=86400`;
                router.push('/dashboard');
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            setError((0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getErrorMessage"])(err));
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-[#0f172a] overflow-hidden p-6 relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-[10%] left-[5%] w-64 h-64 bg-primary-light/20 rounded-full blur-[100px]"
                    }, void 0, false, {
                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-[10%] right-[5%] w-96 h-96 bg-accent/20 rounded-full blur-[120px]"
                    }, void 0, false, {
                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `max-w-md w-full space-y-8 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mx-auto w-20 h-20 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-[2rem] flex items-center justify-center shadow-2xl relative group overflow-hidden",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 bg-gradient-to-tr from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                    }, void 0, false, {
                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                        lineNumber: 80,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CubeIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CubeIcon$3e$__["CubeIcon"], {
                                        className: "h-10 w-10 text-white relative z-10"
                                    }, void 0, false, {
                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                        lineNumber: 81,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                lineNumber: 79,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-3xl font-black text-white tracking-tighter",
                                        children: "POS Admin"
                                    }, void 0, false, {
                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                        lineNumber: 84,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-white/70 font-medium",
                                        children: "Real-Time Inventory Dashboard"
                                    }, void 0, false, {
                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                        lineNumber: 85,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "card p-8 bg-surface border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary-light"
                            }, void 0, false, {
                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                lineNumber: 91,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-black text-primary tracking-tight",
                                        children: "Welcome back"
                                    }, void 0, false, {
                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                        lineNumber: 94,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-text-secondary text-sm font-medium",
                                        children: "Sign in to your administrative account"
                                    }, void 0, false, {
                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                        lineNumber: 95,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                className: "space-y-6",
                                onSubmit: handleSubmit,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                        htmlFor: "email",
                                                        className: "font-bold text-primary",
                                                        children: "Email Address"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                        lineNumber: 101,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "relative group",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$EnvelopeIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EnvelopeIcon$3e$__["EnvelopeIcon"], {
                                                                className: "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                                lineNumber: 103,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                id: "email",
                                                                type: "email",
                                                                required: true,
                                                                placeholder: "you@example.com",
                                                                value: email,
                                                                onChange: (e)=>setEmail(e.target.value),
                                                                className: "!pl-12 h-12 bg-white/50 border-divider focus:border-primary focus:ring-primary/20 transition-all font-medium"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                                lineNumber: 104,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                        lineNumber: 102,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                lineNumber: 100,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex justify-between items-center",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                            htmlFor: "password",
                                                            className: "font-bold text-primary",
                                                            children: "Password"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                            lineNumber: 118,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                        lineNumber: 117,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "relative group",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$LockClosedIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LockClosedIcon$3e$__["LockClosedIcon"], {
                                                                className: "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                                lineNumber: 121,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                id: "password",
                                                                type: showPassword ? "text" : "password",
                                                                required: true,
                                                                placeholder: "••••••••",
                                                                value: password,
                                                                onChange: (e)=>setPassword(e.target.value),
                                                                className: "!pl-12 !pr-12 h-12 bg-white/50 border-divider focus:border-primary focus:ring-primary/20 transition-all font-medium"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                                lineNumber: 122,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>setShowPassword(!showPassword),
                                                                className: "absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors",
                                                                children: showPassword ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$EyeSlashIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeSlashIcon$3e$__["EyeSlashIcon"], {
                                                                    className: "h-5 w-5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                                    lineNumber: 136,
                                                                    columnNumber: 37
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$EyeIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeIcon$3e$__["EyeIcon"], {
                                                                    className: "h-5 w-5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                                    lineNumber: 136,
                                                                    columnNumber: 76
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                                lineNumber: 131,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                        lineNumber: 120,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                lineNumber: 116,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                        lineNumber: 99,
                                        columnNumber: 13
                                    }, this),
                                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-4 bg-error/5 border border-error/10 rounded-xl animate-shake",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-center text-sm font-bold text-error leading-relaxed",
                                            children: error
                                        }, void 0, false, {
                                            fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                            lineNumber: 144,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                        lineNumber: 143,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        type: "submit",
                                        disabled: loading,
                                        className: "w-full h-14 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98] mt-2 relative overflow-hidden group/btn",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"
                                            }, void 0, false, {
                                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                lineNumber: 155,
                                                columnNumber: 15
                                            }, this),
                                            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                        lineNumber: 158,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Signing In..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                        lineNumber: 159,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                lineNumber: 157,
                                                columnNumber: 17
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ArrowRightOnRectangleIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRightOnRectangleIcon$3e$__["ArrowRightOnRectangleIcon"], {
                                                        className: "h-5 w-5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                        lineNumber: 163,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Sign In"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                        lineNumber: 164,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                                lineNumber: 162,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                        lineNumber: 150,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                lineNumber: 98,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-8 pt-6 border-t border-divider text-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-text-secondary font-bold uppercase tracking-widest leading-loose",
                                    children: [
                                        "EcoTracker POS Web ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                            fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                            lineNumber: 173,
                                            columnNumber: 34
                                        }, this),
                                        "© 2026"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                    lineNumber: 172,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                                lineNumber: 171,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Xul/ecotracker_pos_app/admin-dashboard/src/app/login/page.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
_s(LoginPage, "kqruQ7TI1ui/3xFXRySWDTMFJjM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Xul$2f$ecotracker_pos_app$2f$admin$2d$dashboard$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = LoginPage;
var _c;
__turbopack_context__.k.register(_c, "LoginPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Xul_ecotracker_pos_app_admin-dashboard_src_10cf2dbb._.js.map