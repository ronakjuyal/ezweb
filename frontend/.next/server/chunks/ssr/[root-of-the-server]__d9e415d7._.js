module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/lib/component-loader.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
            throw new Error(`Failed to load component from ${componentUrl}`);
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
        const ReactModule = await __turbopack_context__.A("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript, async loader)");
        const JsxRuntimeModule = await __turbopack_context__.A("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-runtime.js [app-ssr] (ecmascript, async loader)");
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
                    return `const ${parts[1].trim()} = window.__REACT__.${parts[0].trim()};`;
                } else {
                    // No alias: "useState" -> "const useState = window.__REACT__.useState;"
                    const name = parts[0].trim();
                    return `const ${name} = window.__REACT__.${name};`;
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
                    return `const ${parts[1].trim()} = window.__JSX_RUNTIME__.${parts[0].trim()};`;
                } else {
                    // No alias: "jsx" -> "const jsx = window.__JSX_RUNTIME__.jsx;"
                    const name = parts[0].trim();
                    return `const ${name} = window.__JSX_RUNTIME__.${name};`;
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
        const React = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
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
                        console.log(`Advanced field ${nestedKey}: using custom value`, customData[nestedKey]);
                    } else {
                        finalData[nestedKey] = nestedField.default;
                        console.log(`Advanced field ${nestedKey}: using default`, nestedField.default);
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
                console.error(`Required field '${key}' is missing`);
                return false;
            }
            // Type validation
            if (data[key] !== undefined) {
                const value = data[key];
                switch(field.type){
                    case 'number':
                        if (typeof value !== 'number' && isNaN(Number(value))) {
                            console.error(`Field '${key}' must be a number`);
                            return false;
                        }
                        break;
                    case 'boolean':
                        if (typeof value !== 'boolean') {
                            console.error(`Field '${key}' must be a boolean`);
                            return false;
                        }
                        break;
                    case 'url':
                        try {
                            new URL(value);
                        } catch  {
                            console.error(`Field '${key}' must be a valid URL`);
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
}),
"[project]/components/DynamicComponentRenderer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DynamicComponentRenderer",
    ()=>DynamicComponentRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$component$2d$loader$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/component-loader.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
function DynamicComponentRenderer({ websiteComponent }) {
    const [Component, setComponent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [componentData, setComponentData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function loadComponent() {
            try {
                setLoading(true);
                setError(null);
                // Parse the schema from the component registry
                const schema = JSON.parse(websiteComponent.componentRegistry.schema);
                // Parse the component data with schema defaults
                const parsedData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$component$2d$loader$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseSchemaData"])(websiteComponent.schemaData, schema);
                console.log('Component Registry:', websiteComponent.componentRegistry.name);
                console.log('Schema Data (raw):', websiteComponent.schemaData);
                console.log('Parsed Data:', parsedData);
                // Load the component from S3
                const loadedComponent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$component$2d$loader$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadComponentFromUrl"])(websiteComponent.componentRegistry.s3FileUrl, schema);
                setComponent(()=>loadedComponent.Component);
                setComponentData(parsedData);
                setLoading(false);
            } catch (err) {
                console.error('Failed to load component:', err);
                setError('Failed to load component');
                setLoading(false);
            }
        }
        loadComponent();
    }, [
        websiteComponent
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center p-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-red-50 border border-red-200 rounded-lg p-4 m-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center p-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Component, {
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
}),
"[project]/components/WebsiteRenderer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebsiteRenderer",
    ()=>WebsiteRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DynamicComponentRenderer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DynamicComponentRenderer.tsx [app-ssr] (ecmascript)");
'use client';
;
;
function WebsiteRenderer({ components }) {
    if (!components || components.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center min-h-screen bg-gray-50",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center p-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-gray-800 mb-2",
                        children: "No Components Yet"
                    }, void 0, false, {
                        fileName: "[project]/components/WebsiteRenderer.tsx",
                        lineNumber: 16,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full",
        children: components.map((component)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DynamicComponentRenderer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DynamicComponentRenderer"], {
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
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d9e415d7._.js.map