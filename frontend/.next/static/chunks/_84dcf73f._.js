(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/component-loader.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearComponentCache",
    ()=>clearComponentCache,
    "getCachedComponentCount",
    ()=>getCachedComponentCount,
    "loadComponentFromUrl",
    ()=>loadComponentFromUrl,
    "loadComponentWithEval",
    ()=>loadComponentWithEval,
    "parseSchemaData",
    ()=>parseSchemaData,
    "validateComponentData",
    ()=>validateComponentData
]);
// Cache for loaded components
const componentCache = new Map();
async function loadComponentFromUrl(componentUrl, schema) {
    // Check cache first
    if (componentCache.has(componentUrl)) {
        return componentCache.get(componentUrl);
    }
    try {
        // Fetch the component code from S3
        const response = await fetch(componentUrl);
        if (!response.ok) {
            throw new Error("Failed to load component from ".concat(componentUrl));
        }
        const componentCode = await response.text();
        // Create a module from the code
        // The component file should export a default React component
        const Component = await executeComponentCode(componentCode);
        const loadedComponent = {
            Component,
            schema
        };
        // Cache the loaded component
        componentCache.set(componentUrl, loadedComponent);
        return loadedComponent;
    } catch (error) {
        console.error('Error loading component:', error);
        throw error;
    }
}
/**
 * Executes component code and returns the React component
 * This uses dynamic import with data URLs to safely execute the code
 */ async function executeComponentCode(code) {
    try {
        // Import React from Next.js to reuse the same instance
        const ReactModule = await __turbopack_context__.A("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript, async loader)");
        const JsxRuntimeModule = await __turbopack_context__.A("[project]/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript, async loader)");
        // Make React globally available for this context
        window.__REACT__ = ReactModule;
        window.__JSX_RUNTIME__ = JsxRuntimeModule;
        // Replace imports with references to global variables
        let processedCode = code;
        // Remove/replace standalone react import
        processedCode = processedCode.replace(/import\s*"react"\s*;/g, '');
        // Replace React hook imports - handle "as" aliasing
        processedCode = processedCode.replace(/import\s*\{([^}]+)\}\s*from\s*"react"\s*;/g, (match, imports)=>{
            // Parse imports like "useState as m,useEffect as h"
            const mappings = imports.split(',').map((imp)=>{
                const parts = imp.trim().split(/\s+as\s+/);
                if (parts.length === 2) {
                    // Has alias: "useState as m" -> "const m = window.__REACT__.useState;"
                    return "const ".concat(parts[1].trim(), " = window.__REACT__.").concat(parts[0].trim(), ";");
                } else {
                    // No alias: "useState" -> "const useState = window.__REACT__.useState;"
                    const name = parts[0].trim();
                    return "const ".concat(name, " = window.__REACT__.").concat(name, ";");
                }
            });
            return mappings.join('');
        });
        // Replace jsx-runtime imports - handle "as" aliasing
        processedCode = processedCode.replace(/import\s*\{([^}]+)\}\s*from\s*"react\/jsx-runtime"\s*;/g, (match, imports)=>{
            // Parse imports like "jsx as e,jsxs as l"
            const mappings = imports.split(',').map((imp)=>{
                const parts = imp.trim().split(/\s+as\s+/);
                if (parts.length === 2) {
                    // Has alias: "jsx as e" -> "const e = window.__JSX_RUNTIME__.jsx;"
                    return "const ".concat(parts[1].trim(), " = window.__JSX_RUNTIME__.").concat(parts[0].trim(), ";");
                } else {
                    // No alias: "jsx" -> "const jsx = window.__JSX_RUNTIME__.jsx;"
                    const name = parts[0].trim();
                    return "const ".concat(name, " = window.__JSX_RUNTIME__.").concat(name, ";");
                }
            });
            return mappings.join('');
        });
        console.log('Original code (first 300 chars):', code.substring(0, 300));
        console.log('Processed code (first 300 chars):', processedCode.substring(0, 300));
        // Create a blob URL for the module
        const blob = new Blob([
            processedCode
        ], {
            type: 'text/javascript'
        });
        const url = URL.createObjectURL(blob);
        try {
            // Import the module
            const module = await import(/* webpackIgnore: true */ url);
            // Clean up the blob URL
            URL.revokeObjectURL(url);
            // Return the default export
            return module.default;
        } catch (importError) {
            URL.revokeObjectURL(url);
            console.error('Import error details:', importError);
            throw importError;
        }
    } catch (error) {
        console.error('Error executing component code:', error);
        throw error;
    }
}
function loadComponentWithEval(code) {
    try {
        // Create a safe execution context
        const React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
        const exports = {};
        const module = {
            exports
        };
        // Execute the code
        const func = new Function('React', 'exports', 'module', code);
        func(React, exports, module);
        // Return the component
        return module.exports.default || module.exports;
    } catch (error) {
        console.error('Error executing component with eval:', error);
        throw error;
    }
}
function parseSchemaData(schemaDataJson, schema) {
    try {
        const customData = JSON.parse(schemaDataJson);
        const finalData = {};
        console.log('Schema fields:', Object.keys(schema.schema));
        console.log('Custom data keys:', Object.keys(customData));
        // Merge schema defaults with custom data
        Object.keys(schema.schema).forEach((key)=>{
            const field = schema.schema[key];
            // Handle 'advanced' type which has nested schema - flatten the fields to root level
            if (field.type === 'advanced' && field.schema) {
                console.log('Processing advanced field:', key);
                console.log('Advanced nested fields:', Object.keys(field.schema));
                // Parse nested schema fields and add them directly to finalData (flattened)
                Object.keys(field.schema).forEach((nestedKey)=>{
                    const nestedField = field.schema[nestedKey];
                    // Check if the nested field exists at root level of customData (Flutter saves it flattened)
                    if (customData[nestedKey] !== undefined) {
                        finalData[nestedKey] = customData[nestedKey];
                        console.log("Advanced field ".concat(nestedKey, ": using custom value"), customData[nestedKey]);
                    } else {
                        finalData[nestedKey] = nestedField.default;
                        console.log("Advanced field ".concat(nestedKey, ": using default"), nestedField.default);
                    }
                });
            } else {
                // Regular field
                finalData[key] = customData[key] !== undefined ? customData[key] : field.default;
            }
        });
        console.log('Final parsed data:', finalData);
        return finalData;
    } catch (error) {
        console.error('Error parsing schema data:', error);
        return {};
    }
}
function validateComponentData(data, schema) {
    try {
        for(const key in schema.schema){
            const field = schema.schema[key];
            // Check required fields
            if (field.required && (data[key] === undefined || data[key] === null || data[key] === '')) {
                console.error("Required field '".concat(key, "' is missing"));
                return false;
            }
            // Type validation
            if (data[key] !== undefined) {
                const value = data[key];
                switch(field.type){
                    case 'number':
                        if (typeof value !== 'number' && isNaN(Number(value))) {
                            console.error("Field '".concat(key, "' must be a number"));
                            return false;
                        }
                        break;
                    case 'boolean':
                        if (typeof value !== 'boolean') {
                            console.error("Field '".concat(key, "' must be a boolean"));
                            return false;
                        }
                        break;
                    case 'url':
                        try {
                            new URL(value);
                        } catch (e) {
                            console.error("Field '".concat(key, "' must be a valid URL"));
                            return false;
                        }
                        break;
                }
            }
        }
        return true;
    } catch (error) {
        console.error('Error validating component data:', error);
        return false;
    }
}
function clearComponentCache() {
    componentCache.clear();
}
function getCachedComponentCount() {
    return componentCache.size;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/DynamicComponentRenderer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DynamicComponentRenderer",
    ()=>DynamicComponentRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$component$2d$loader$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/component-loader.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function DynamicComponentRenderer(param) {
    let { websiteComponent } = param;
    _s();
    const [Component, setComponent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [componentData, setComponentData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DynamicComponentRenderer.useEffect": ()=>{
            async function loadComponent() {
                try {
                    setLoading(true);
                    setError(null);
                    // Parse the schema from the component registry
                    const schema = JSON.parse(websiteComponent.componentRegistry.schema);
                    // Parse the component data with schema defaults
                    const parsedData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$component$2d$loader$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseSchemaData"])(websiteComponent.schemaData, schema);
                    console.log('Component Registry:', websiteComponent.componentRegistry.name);
                    console.log('Schema Data (raw):', websiteComponent.schemaData);
                    console.log('Parsed Data:', parsedData);
                    // Load the component from S3
                    const loadedComponent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$component$2d$loader$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadComponentFromUrl"])(websiteComponent.componentRegistry.s3FileUrl, schema);
                    setComponent({
                        "DynamicComponentRenderer.useEffect.loadComponent": ()=>loadedComponent.Component
                    }["DynamicComponentRenderer.useEffect.loadComponent"]);
                    setComponentData(parsedData);
                    setLoading(false);
                } catch (err) {
                    console.error('Failed to load component:', err);
                    setError('Failed to load component');
                    setLoading(false);
                }
            }
            loadComponent();
        }
    }["DynamicComponentRenderer.useEffect"], [
        websiteComponent
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center p-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"
            }, void 0, false, {
                fileName: "[project]/components/DynamicComponentRenderer.tsx",
                lineNumber: 55,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/DynamicComponentRenderer.tsx",
            lineNumber: 54,
            columnNumber: 7
        }, this);
    }
    if (error || !Component) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-red-50 border border-red-200 rounded-lg p-4 m-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-red-800",
                children: error || 'Component not found'
            }, void 0, false, {
                fileName: "[project]/components/DynamicComponentRenderer.tsx",
                lineNumber: 63,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/DynamicComponentRenderer.tsx",
            lineNumber: 62,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center p-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
            }, void 0, false, {
                fileName: "[project]/components/DynamicComponentRenderer.tsx",
                lineNumber: 72,
                columnNumber: 11
            }, void 0)
        }, void 0, false, {
            fileName: "[project]/components/DynamicComponentRenderer.tsx",
            lineNumber: 71,
            columnNumber: 9
        }, void 0),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Component, {
            ...componentData
        }, void 0, false, {
            fileName: "[project]/components/DynamicComponentRenderer.tsx",
            lineNumber: 76,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/DynamicComponentRenderer.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
_s(DynamicComponentRenderer, "ymYoho/BzhMtacvmouhDMZPvPm8=");
_c = DynamicComponentRenderer;
var _c;
__turbopack_context__.k.register(_c, "DynamicComponentRenderer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/WebsiteRenderer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebsiteRenderer",
    ()=>WebsiteRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DynamicComponentRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DynamicComponentRenderer.tsx [app-client] (ecmascript)");
'use client';
;
;
function WebsiteRenderer(param) {
    let { components } = param;
    if (!components || components.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center min-h-screen bg-gray-50",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center p-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-gray-800 mb-2",
                        children: "No Components Yet"
                    }, void 0, false, {
                        fileName: "[project]/components/WebsiteRenderer.tsx",
                        lineNumber: 16,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600",
                        children: "This website doesn't have any components configured yet."
                    }, void 0, false, {
                        fileName: "[project]/components/WebsiteRenderer.tsx",
                        lineNumber: 17,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/WebsiteRenderer.tsx",
                lineNumber: 15,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/WebsiteRenderer.tsx",
            lineNumber: 14,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full",
        children: components.map((component)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DynamicComponentRenderer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DynamicComponentRenderer"], {
                    websiteComponent: component
                }, void 0, false, {
                    fileName: "[project]/components/WebsiteRenderer.tsx",
                    lineNumber: 29,
                    columnNumber: 11
                }, this)
            }, component.id, false, {
                fileName: "[project]/components/WebsiteRenderer.tsx",
                lineNumber: 28,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/components/WebsiteRenderer.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_c = WebsiteRenderer;
var _c;
__turbopack_context__.k.register(_c, "WebsiteRenderer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        "object" === typeof node && null !== node && node.$$typeof === REACT_ELEMENT_TYPE && node._store && (node._store.validated = 1);
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
]);

//# sourceMappingURL=_84dcf73f._.js.map