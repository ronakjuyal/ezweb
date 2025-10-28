module.exports = [
"[project]/.next-internal/server/app/sites/[subdomain]/page/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[project]/app/favicon.ico.mjs { IMAGE => \"[project]/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/favicon.ico.mjs { IMAGE => \"[project]/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/lib/config.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config
]);
const config = {
    apiUrl: ("TURBOPACK compile-time value", "http://localhost:8080/api") || 'http://localhost:8080/api',
    mainDomain: ("TURBOPACK compile-time value", "localhost:3000") || 'localhost:3000',
    s3BucketUrl: ("TURBOPACK compile-time value", "https://ezweb-s3-2.s3.eu-north-1.amazonaws.com") || ''
};
}),
"[project]/lib/api-client.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "apiClient",
    ()=>apiClient
]);
(()=>{
    const e = new Error("Cannot find module 'axios'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/config.ts [app-rsc] (ecmascript)");
;
;
class ApiClient {
    api;
    constructor(){
        this.api = axios.create({
            baseURL: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["config"].apiUrl,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // Request interceptor to add auth token
        this.api.interceptors.request.use((config)=>{
            const token = this.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error)=>Promise.reject(error));
        // Response interceptor to handle token refresh
        this.api.interceptors.response.use((response)=>response, async (error)=>{
            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const refreshToken = this.getRefreshToken();
                    if (refreshToken) {
                        const { data } = await axios.post(`${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["config"].apiUrl}/auth/refresh`, null, {
                            params: {
                                refreshToken
                            }
                        });
                        this.setToken(data.accessToken);
                        this.setRefreshToken(data.refreshToken);
                        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                        return this.api(originalRequest);
                    }
                } catch (refreshError) {
                    this.clearAuth();
                    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                    ;
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        });
    }
    // Auth methods
    setToken(token) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    getToken() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return null;
    }
    setRefreshToken(token) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    getRefreshToken() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return null;
    }
    clearAuth() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    // Authentication APIs
    async register(data) {
        const response = await this.api.post('/auth/register', data);
        this.setToken(response.data.accessToken);
        this.setRefreshToken(response.data.refreshToken);
        return response.data;
    }
    async login(data) {
        const response = await this.api.post('/auth/login', data);
        this.setToken(response.data.accessToken);
        this.setRefreshToken(response.data.refreshToken);
        return response.data;
    }
    logout() {
        this.clearAuth();
    }
    // Website APIs
    async getWebsites() {
        const response = await this.api.get('/websites');
        return response.data;
    }
    async getWebsiteById(id) {
        const response = await this.api.get(`/websites/${id}`);
        return response.data;
    }
    async getWebsiteBySubdomain(subdomain) {
        const response = await this.api.get(`/websites/subdomain/${subdomain}`);
        return response.data;
    }
    async createWebsite(data) {
        const response = await this.api.post('/websites', data);
        return response.data;
    }
    async updateWebsite(id, data) {
        const response = await this.api.put(`/websites/${id}`, data);
        return response.data;
    }
    async deleteWebsite(id) {
        const response = await this.api.delete(`/websites/${id}`);
        return response.data;
    }
    // Component Registry APIs
    async getActiveComponents() {
        const response = await this.api.get('/components');
        return response.data;
    }
    async getComponentById(id) {
        const response = await this.api.get(`/components/${id}`);
        return response.data;
    }
    async getComponentsByCategory(category) {
        const response = await this.api.get(`/components/category/${category}`);
        return response.data;
    }
    // Admin - Component Registry APIs
    async createComponent(data) {
        const response = await this.api.post('/admin/components', data);
        return response.data;
    }
    async getAllComponents() {
        const response = await this.api.get('/admin/components');
        return response.data;
    }
    async updateComponent(id, data) {
        const response = await this.api.put(`/admin/components/${id}`, data);
        return response.data;
    }
    async deleteComponent(id) {
        const response = await this.api.delete(`/admin/components/${id}`);
        return response.data;
    }
    // Website Component APIs
    async getWebsiteComponents(websiteId) {
        const response = await this.api.get(`/websites/${websiteId}/components`);
        return response.data;
    }
    async getVisibleComponents(websiteId) {
        const response = await this.api.get(`/websites/${websiteId}/components/visible`);
        return response.data;
    }
    async addComponentToWebsite(websiteId, data) {
        const response = await this.api.post(`/websites/${websiteId}/components`, data);
        return response.data;
    }
    async updateWebsiteComponent(websiteId, id, data) {
        const response = await this.api.put(`/websites/${websiteId}/components/${id}`, data);
        return response.data;
    }
    async deleteWebsiteComponent(websiteId, id) {
        const response = await this.api.delete(`/websites/${websiteId}/components/${id}`);
        return response.data;
    }
    async reorderComponents(websiteId, componentIds) {
        const response = await this.api.put(`/websites/${websiteId}/components/reorder`, componentIds);
        return response.data;
    }
    // Product APIs
    async getWebsiteProducts(websiteId) {
        const response = await this.api.get(`/websites/${websiteId}/products`);
        return response.data;
    }
    async getAvailableProducts(websiteId) {
        const response = await this.api.get(`/websites/${websiteId}/products/available`);
        return response.data;
    }
    async createProduct(websiteId, data) {
        const response = await this.api.post(`/websites/${websiteId}/products`, data);
        return response.data;
    }
    async updateProduct(websiteId, id, data) {
        const response = await this.api.put(`/websites/${websiteId}/products/${id}`, data);
        return response.data;
    }
    async deleteProduct(websiteId, id) {
        const response = await this.api.delete(`/websites/${websiteId}/products/${id}`);
        return response.data;
    }
    // Media APIs
    async uploadMedia(websiteId, file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await this.api.post(`/websites/${websiteId}/media`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
    async getWebsiteMedia(websiteId) {
        const response = await this.api.get(`/websites/${websiteId}/media`);
        return response.data;
    }
    async deleteMedia(id) {
        const response = await this.api.delete(`/media/${id}`);
        return response.data;
    }
}
const apiClient = new ApiClient();
}),
"[project]/components/WebsiteRenderer.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "WebsiteRenderer",
    ()=>WebsiteRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const WebsiteRenderer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call WebsiteRenderer() from the server but WebsiteRenderer is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/WebsiteRenderer.tsx <module evaluation>", "WebsiteRenderer");
}),
"[project]/components/WebsiteRenderer.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "WebsiteRenderer",
    ()=>WebsiteRenderer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const WebsiteRenderer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call WebsiteRenderer() from the server but WebsiteRenderer is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/WebsiteRenderer.tsx", "WebsiteRenderer");
}),
"[project]/components/WebsiteRenderer.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WebsiteRenderer$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/WebsiteRenderer.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WebsiteRenderer$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/WebsiteRenderer.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WebsiteRenderer$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/sites/[subdomain]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SubdomainPage,
    "generateMetadata",
    ()=>generateMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-client.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WebsiteRenderer$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/WebsiteRenderer.tsx [app-rsc] (ecmascript)");
;
;
;
async function SubdomainPage({ params }) {
    const { subdomain } = await params;
    try {
        // Fetch website data by subdomain
        const website = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiClient"].getWebsiteBySubdomain(subdomain);
        // Check if website is published
        if (!website.published) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center justify-center min-h-screen bg-gray-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center p-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-3xl font-bold text-gray-800 mb-2",
                            children: "Website Not Published"
                        }, void 0, false, {
                            fileName: "[project]/app/sites/[subdomain]/page.tsx",
                            lineNumber: 23,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600",
                            children: "This website is not yet available."
                        }, void 0, false, {
                            fileName: "[project]/app/sites/[subdomain]/page.tsx",
                            lineNumber: 24,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/sites/[subdomain]/page.tsx",
                    lineNumber: 22,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/sites/[subdomain]/page.tsx",
                lineNumber: 21,
                columnNumber: 9
            }, this);
        }
        // Fetch visible components for this website
        const components = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiClient"].getVisibleComponents(website.id);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("head", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                            children: website.title
                        }, void 0, false, {
                            fileName: "[project]/app/sites/[subdomain]/page.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this),
                        website.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("meta", {
                            name: "description",
                            content: website.description
                        }, void 0, false, {
                            fileName: "[project]/app/sites/[subdomain]/page.tsx",
                            lineNumber: 37,
                            columnNumber: 35
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/sites/[subdomain]/page.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$WebsiteRenderer$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WebsiteRenderer"], {
                    components: components
                }, void 0, false, {
                    fileName: "[project]/app/sites/[subdomain]/page.tsx",
                    lineNumber: 39,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true);
    } catch (error) {
        console.error('Error loading website:', error);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center min-h-screen bg-gray-50",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center p-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-3xl font-bold text-gray-800 mb-2",
                        children: "Website Not Found"
                    }, void 0, false, {
                        fileName: "[project]/app/sites/[subdomain]/page.tsx",
                        lineNumber: 48,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600",
                        children: [
                            "The website ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-mono text-blue-600",
                                children: subdomain
                            }, void 0, false, {
                                fileName: "[project]/app/sites/[subdomain]/page.tsx",
                                lineNumber: 50,
                                columnNumber: 25
                            }, this),
                            " does not exist."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/sites/[subdomain]/page.tsx",
                        lineNumber: 49,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/sites/[subdomain]/page.tsx",
                lineNumber: 47,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/sites/[subdomain]/page.tsx",
            lineNumber: 46,
            columnNumber: 7
        }, this);
    }
}
async function generateMetadata({ params }) {
    const { subdomain } = await params;
    try {
        const website = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["apiClient"].getWebsiteBySubdomain(subdomain);
        return {
            title: website.title,
            description: website.description || `Welcome to ${website.title}`
        };
    } catch (error) {
        return {
            title: 'Website Not Found',
            description: 'The requested website could not be found.'
        };
    }
}
}),
"[project]/app/sites/[subdomain]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/sites/[subdomain]/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6ef077ac._.js.map