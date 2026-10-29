(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/PendingUsersList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PendingUsersList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function PendingUsersList({ initialUsers, canAssignAdmin = false, requireEmailVerification = true }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [removedIds, setRemovedIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const users = initialUsers.filter((user)=>!removedIds.includes(user.id));
    const [loadingId, setLoadingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadingAction, setLoadingAction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [roles, setRoles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    async function handleApprove(userId) {
        setLoadingId(userId);
        setLoadingAction('approve');
        setError('');
        try {
            // Call the API endpoint created in Part 1
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    role: roles[userId] ?? 'STAFF'
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to approve user.');
            setRemovedIds((current)=>[
                    ...current,
                    userId
                ]);
            router.refresh();
        } catch (error) {
            console.error('Failed to approve user:', error);
            setError(error instanceof Error ? error.message : 'Failed to approve user.');
        } finally{
            setLoadingId(null);
            setLoadingAction(null);
        }
    }
    async function handleRemove(user) {
        const label = user.name || user.email;
        if (!window.confirm(`Remove ${label}? This deletes their sign-up request and cannot be undone.`)) return;
        setLoadingId(user.id);
        setLoadingAction('remove');
        setError('');
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to remove user.');
            setRemovedIds((current)=>[
                    ...current,
                    user.id
                ]);
            router.refresh();
        } catch (error) {
            console.error('Failed to remove user:', error);
            setError(error instanceof Error ? error.message : 'Failed to remove user.');
        } finally{
            setLoadingId(null);
            setLoadingAction(null);
        }
    }
    // Display empty state if no pending users exist
    if (users.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-8 text-center bg-stone-50 border border-stone-200/80 rounded-2xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-stone-500",
                    children: "No users are currently awaiting approval."
                }, void 0, false, {
                    fileName: "[project]/components/PendingUsersList.tsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>router.refresh(),
                    className: "mt-3 text-xs font-semibold text-stone-700 underline",
                    children: requireEmailVerification ? 'Refresh verification status' : 'Refresh pending users'
                }, void 0, false, {
                    fileName: "[project]/components/PendingUsersList.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/PendingUsersList.tsx",
            lineNumber: 82,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>router.refresh(),
                disabled: loadingId !== null,
                className: "text-xs font-semibold text-stone-700 underline disabled:opacity-50",
                children: requireEmailVerification ? 'Refresh verification status' : 'Refresh pending users'
            }, void 0, false, {
                fileName: "[project]/components/PendingUsersList.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                className: "text-sm text-rose-700",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/PendingUsersList.tsx",
                lineNumber: 97,
                columnNumber: 17
            }, this),
            users.map((user)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-3 p-4 bg-white border border-stone-200/80 rounded-2xl shadow-sm sm:flex-row sm:items-center sm:justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "break-words text-sm font-medium text-stone-800",
                                    children: user.name || 'Unnamed user'
                                }, void 0, false, {
                                    fileName: "[project]/components/PendingUsersList.tsx",
                                    lineNumber: 104,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "break-all text-xs text-stone-500",
                                    children: user.email
                                }, void 0, false, {
                                    fileName: "[project]/components/PendingUsersList.tsx",
                                    lineNumber: 105,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: `mt-1 text-xs ${user.emailVerified ? 'text-emerald-700' : 'text-amber-700'}`,
                                    children: user.emailVerified ? 'Email verified' : requireEmailVerification ? 'Awaiting email verification' : 'Email verification temporarily disabled'
                                }, void 0, false, {
                                    fileName: "[project]/components/PendingUsersList.tsx",
                                    lineNumber: 106,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/PendingUsersList.tsx",
                            lineNumber: 103,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid min-w-0 grid-cols-2 items-center gap-3 sm:flex sm:flex-wrap",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "col-span-2 flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-stone-600",
                                    children: [
                                        "Approve as",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            "aria-label": `Role for ${user.name || user.email}`,
                                            value: roles[user.id] ?? 'STAFF',
                                            disabled: loadingId !== null || requireEmailVerification && !user.emailVerified,
                                            onChange: (event)=>setRoles((current)=>({
                                                        ...current,
                                                        [user.id]: event.target.value === 'ADMIN' ? 'ADMIN' : 'STAFF'
                                                    })),
                                            className: "min-h-11 min-w-0 max-w-full rounded-md border border-stone-300 bg-white px-2 py-1.5 text-base sm:text-sm",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "STAFF",
                                                    children: "Staff"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PendingUsersList.tsx",
                                                    lineNumber: 120,
                                                    columnNumber: 17
                                                }, this),
                                                canAssignAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "ADMIN",
                                                    children: "Admin"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PendingUsersList.tsx",
                                                    lineNumber: 121,
                                                    columnNumber: 36
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/PendingUsersList.tsx",
                                            lineNumber: 113,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PendingUsersList.tsx",
                                    lineNumber: 111,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>handleRemove(user),
                                    disabled: loadingId !== null,
                                    className: "px-4 py-2 text-xs font-medium text-rose-700 bg-white border border-rose-300 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50",
                                    children: loadingId === user.id && loadingAction === 'remove' ? 'Removing...' : 'Remove'
                                }, void 0, false, {
                                    fileName: "[project]/components/PendingUsersList.tsx",
                                    lineNumber: 124,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>handleApprove(user.id),
                                    disabled: loadingId !== null || requireEmailVerification && !user.emailVerified,
                                    className: "px-4 py-2 text-xs font-medium text-stone-50 bg-stone-900 hover:bg-stone-800 rounded-xl transition-all disabled:opacity-50",
                                    children: loadingId === user.id && loadingAction === 'approve' ? 'Approving...' : `Approve ${roles[user.id] === 'ADMIN' ? 'Admin' : 'Staff'}`
                                }, void 0, false, {
                                    fileName: "[project]/components/PendingUsersList.tsx",
                                    lineNumber: 132,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/PendingUsersList.tsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, this)
                    ]
                }, user.id, true, {
                    fileName: "[project]/components/PendingUsersList.tsx",
                    lineNumber: 99,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/components/PendingUsersList.tsx",
        lineNumber: 92,
        columnNumber: 5
    }, this);
}
_s(PendingUsersList, "dQ5rP85agmNjdMwZEMVAX8oHcDI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = PendingUsersList;
var _c;
__turbopack_context__.k.register(_c, "PendingUsersList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_PendingUsersList_tsx_1s5stnt._.js.map