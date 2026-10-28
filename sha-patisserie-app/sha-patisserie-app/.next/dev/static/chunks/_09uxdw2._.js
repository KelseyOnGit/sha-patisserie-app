(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/AccountRoleButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AccountRoleButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function AccountRoleButton({ userId, name, role, onMoved }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const label = role === 'ADMIN' ? 'Admin' : 'Staff';
    async function move() {
        if (!window.confirm(`Move ${name} to ${label}? ${role === 'ADMIN' ? 'This grants full Admin access and removes them from shift scheduling.' : 'This removes Admin access and returns them to the staff roster for their assigned venue.'} Existing records will be retained.`)) return;
        setSaving(true);
        setError('');
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    role
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to change account role.');
            onMoved?.();
            router.refresh();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to change account role.');
        } finally{
            setSaving(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "inline-flex flex-col items-end gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: move,
                disabled: saving,
                className: "rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50",
                children: saving ? 'Moving...' : `Move to ${label}`
            }, void 0, false, {
                fileName: "[project]/components/AccountRoleButton.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                role: "alert",
                className: "text-xs text-rose-700",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/AccountRoleButton.tsx",
                lineNumber: 43,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/AccountRoleButton.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, this);
}
_s(AccountRoleButton, "WVnMNjq3DuK8UEWuXY1nDqGAGFg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AccountRoleButton;
var _c;
__turbopack_context__.k.register(_c, "AccountRoleButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/BottomNav.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BottomNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
'use client';
;
function BottomNav({ activeTab, setActiveTab }) {
    const tabs = [
        {
            id: 'clock',
            label: 'Clock In',
            icon: '⏱️'
        },
        {
            id: 'roster',
            label: 'Roster',
            icon: '📅'
        },
        // { id: 'payslips', label: 'Payslips', icon: '📄' }, // Hidden pending MYOB integration.
        {
            id: 'leave',
            label: 'Leave',
            icon: '📅'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-stone-200 px-6 py-2 z-50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-lg mx-auto flex justify-around items-center",
            children: tabs.map((tab)=>{
                const isActive = activeTab === tab.id;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setActiveTab(tab.id),
                    className: `flex flex-col items-center py-1 px-3 rounded-xl transition-all ${isActive ? 'text-amber-800 font-bold scale-105' : 'text-stone-400 hover:text-stone-600'}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xl",
                            children: tab.icon
                        }, void 0, false, {
                            fileName: "[project]/components/BottomNav.tsx",
                            lineNumber: 31,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-[11px] mt-0.5",
                            children: tab.label
                        }, void 0, false, {
                            fileName: "[project]/components/BottomNav.tsx",
                            lineNumber: 32,
                            columnNumber: 15
                        }, this),
                        isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "w-1 h-1 bg-amber-600 rounded-full mt-1"
                        }, void 0, false, {
                            fileName: "[project]/components/BottomNav.tsx",
                            lineNumber: 34,
                            columnNumber: 17
                        }, this)
                    ]
                }, tab.id, true, {
                    fileName: "[project]/components/BottomNav.tsx",
                    lineNumber: 24,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/components/BottomNav.tsx",
            lineNumber: 20,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/BottomNav.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_c = BottomNav;
var _c;
__turbopack_context__.k.register(_c, "BottomNav");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ClockInCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClockInCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
function ClockInCard({ userName = 'Team Member' }) {
    _s();
    const [time, setTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [currentDate, setCurrentDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [venue, setVenue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Sha');
    const [isClockedIn, setIsClockedIn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [breakShift, setBreakShift] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [breakSeconds, setBreakSeconds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [statusMessage, setStatusMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [upcomingShift, setUpcomingShift] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Update live clock on client side
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClockInCard.useEffect": ()=>{
            const updateClock = {
                "ClockInCard.useEffect.updateClock": ()=>{
                    const now = new Date();
                    setCurrentDate(new Intl.DateTimeFormat('en-AU', {
                        timeZone: 'Australia/Perth',
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }).format(now));
                    setTime(new Intl.DateTimeFormat('en-AU', {
                        timeZone: 'Australia/Perth',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    }).format(now));
                }
            }["ClockInCard.useEffect.updateClock"];
            updateClock();
            const interval = setInterval(updateClock, 1000);
            return ({
                "ClockInCard.useEffect": ()=>clearInterval(interval)
            })["ClockInCard.useEffect"];
        }
    }["ClockInCard.useEffect"], []);
    const loadBreakStatus = async ()=>{
        try {
            const res = await fetch('/api/shifts/breaks');
            if (!res.ok) return;
            const data = await res.json();
            setBreakShift(data.shift || null);
        } catch (error) {
            console.error('Failed to load break status:', error);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClockInCard.useEffect": ()=>{
            loadBreakStatus();
        }
    }["ClockInCard.useEffect"], [
        isClockedIn
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClockInCard.useEffect": ()=>{
            if (!breakShift?.startBreak || breakShift.endBreak) {
                setBreakSeconds(0);
                return;
            }
            const updateBreakTimer = {
                "ClockInCard.useEffect.updateBreakTimer": ()=>{
                    const elapsed = Math.floor((Date.now() - new Date(breakShift.startBreak).getTime()) / 1000);
                    const limit = breakShift.presetBreakMinutes * 60;
                    setBreakSeconds(Math.max(limit - elapsed, 0));
                }
            }["ClockInCard.useEffect.updateBreakTimer"];
            updateBreakTimer();
            const interval = setInterval(updateBreakTimer, 1000);
            return ({
                "ClockInCard.useEffect": ()=>clearInterval(interval)
            })["ClockInCard.useEffect"];
        }
    }["ClockInCard.useEffect"], [
        breakShift
    ]);
    const handleBreakToggle = async ()=>{
        if (!breakShift) {
            setStatusMessage('No scheduled shift is active for a break.');
            return;
        }
        setLoading(true);
        const action = breakShift.startBreak && !breakShift.endBreak ? 'FINISH' : 'START';
        try {
            const res = await fetch('/api/shifts/breaks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    shiftId: breakShift.id,
                    action
                })
            });
            const data = await res.json();
            if (!res.ok) {
                setStatusMessage(data.error || 'Unable to update break.');
            } else {
                setBreakShift(data.shift);
                setStatusMessage(action === 'START' ? 'Break started successfully.' : 'Break finished successfully.');
            }
        } catch (error) {
            setStatusMessage('Unable to connect to the server.');
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClockInCard.useEffect": ()=>{
            fetch('/api/shifts/clock').then({
                "ClockInCard.useEffect": async (res)=>{
                    if (!res.ok) return null;
                    return res.json();
                }
            }["ClockInCard.useEffect"]).then({
                "ClockInCard.useEffect": (data)=>{
                    setIsClockedIn(Boolean(data?.activeLog));
                }
            }["ClockInCard.useEffect"]).catch({
                "ClockInCard.useEffect": (error)=>{
                    console.error('Failed to load clock status:', error);
                }
            }["ClockInCard.useEffect"]);
            // Fetch upcoming shift for the logged-in staff
            fetch('/api/roster/mine').then({
                "ClockInCard.useEffect": async (res)=>{
                    if (!res.ok) return null;
                    return res.json();
                }
            }["ClockInCard.useEffect"]).then({
                "ClockInCard.useEffect": (data)=>{
                    if (Array.isArray(data?.shifts) && data.shifts.length > 0) {
                        setUpcomingShift(data.shifts[0]);
                    }
                }
            }["ClockInCard.useEffect"]).catch({
                "ClockInCard.useEffect": (err)=>{
                    console.error('Failed to load upcoming shift:', err);
                }
            }["ClockInCard.useEffect"]);
        }
    }["ClockInCard.useEffect"], []);
    const handleClockAction = async (action)=>{
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }
        setLoading(true);
        const submitClockAction = async (userLat, userLng)=>{
            try {
                const res = await fetch('/api/shifts/clock', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: action === 'in' ? 'clock-in' : 'clock-out',
                        location: venue === 'Zushi Bento' ? 'ZB' : venue === 'Test' ? 'Test' : 'Sha',
                        userLat,
                        userLng
                    })
                });
                const data = await res.json();
                if (!res.ok) {
                    if (res.status === 400 && data.error === 'You are already clocked in!') {
                        setIsClockedIn(true);
                    }
                    alert(data.error || 'Failed to process request');
                } else {
                    setIsClockedIn(action === 'in');
                    setStatusMessage(action === 'in' ? 'You have successfully clocked in.' : 'You have successfully clocked out.');
                    if (action === 'out') setBreakShift(null);
                    await loadBreakStatus();
                }
            } catch (err) {
                console.error('Clocking error:', err);
                alert('An error occurred while connecting to the server.');
            } finally{
                setLoading(false);
            }
        };
        navigator.geolocation.getCurrentPosition((position)=>submitClockAction(position.coords.latitude, position.coords.longitude), (error)=>{
            const errorMessage = error.code === error.PERMISSION_DENIED ? 'Location permission was denied.' : error.code === error.POSITION_UNAVAILABLE ? 'Your device could not determine its location.' : 'Location lookup timed out.';
            console.error('Geolocation error:', error.code, error.message);
            if ("TURBOPACK compile-time truthy", 1) {
                submitClockAction(-31.9056, 115.9392);
                return;
            }
            //TURBOPACK unreachable
            ;
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full bg-[#FAF7F2] border border-[#EADBC8] rounded-3xl p-6 shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-center mb-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-[#EAE3D2] text-stone-700 px-4 py-2 rounded-xl text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-[11px] font-semibold text-stone-600",
                            children: currentDate || 'Loading date...'
                        }, void 0, false, {
                            fileName: "[project]/components/ClockInCard.tsx",
                            lineNumber: 224,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-1 flex items-center justify-center gap-2 font-mono text-xs tracking-wide",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                                }, void 0, false, {
                                    fileName: "[project]/components/ClockInCard.tsx",
                                    lineNumber: 226,
                                    columnNumber: 13
                                }, this),
                                time || '12:00:00 PM'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ClockInCard.tsx",
                            lineNumber: 225,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ClockInCard.tsx",
                    lineNumber: 223,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 222,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "venue-select",
                        className: "block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2",
                        children: "Venue Location"
                    }, void 0, false, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 234,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                id: "venue-select",
                                value: venue,
                                onChange: (e)=>setVenue(e.target.value),
                                className: "w-full py-3.5 px-4 pr-10 rounded-2xl text-sm font-bold bg-[#EADBC8] text-stone-800 border border-[#D8C4B6] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "Sha",
                                        children: "📍 Sha Patisserie"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ClockInCard.tsx",
                                        lineNumber: 244,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "Zushi Bento",
                                        children: "📍 Zushi Bento"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ClockInCard.tsx",
                                        lineNumber: 245,
                                        columnNumber: 13
                                    }, this),
                                    ("TURBOPACK compile-time value", "true") === 'true' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "Test",
                                        children: "🧪 Office (Test)"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ClockInCard.tsx",
                                        lineNumber: 247,
                                        columnNumber: 3
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ClockInCard.tsx",
                                lineNumber: 238,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-700",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    className: "w-4 h-4 fill-current",
                                    viewBox: "0 0 20 20",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ClockInCard.tsx",
                                        lineNumber: 252,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/ClockInCard.tsx",
                                    lineNumber: 251,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/ClockInCard.tsx",
                                lineNumber: 250,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 237,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 233,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#EAE3D2]/60 rounded-2xl p-4 flex justify-between items-center mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "block text-[10px] font-bold uppercase tracking-wider text-stone-400",
                                children: "Logged in as"
                            }, void 0, false, {
                                fileName: "[project]/components/ClockInCard.tsx",
                                lineNumber: 261,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-bold text-stone-800",
                                children: userName
                            }, void 0, false, {
                                fileName: "[project]/components/ClockInCard.tsx",
                                lineNumber: 264,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 260,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-right",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${isClockedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`,
                            children: isClockedIn ? 'Clocked In' : 'Clocked Out'
                        }, void 0, false, {
                            fileName: "[project]/components/ClockInCard.tsx",
                            lineNumber: 267,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 266,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 259,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6 rounded-2xl bg-[#EAE3D2]/40 border border-[#D8C4B6]/60 p-4 text-left",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-bold uppercase tracking-wider text-stone-500",
                                children: "Upcoming Shift"
                            }, void 0, false, {
                                fileName: "[project]/components/ClockInCard.tsx",
                                lineNumber: 278,
                                columnNumber: 11
                            }, this),
                            upcomingShift && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] font-semibold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full",
                                children: "Scheduled"
                            }, void 0, false, {
                                fileName: "[project]/components/ClockInCard.tsx",
                                lineNumber: 280,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 277,
                        columnNumber: 9
                    }, this),
                    upcomingShift ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-bold text-stone-800",
                                children: [
                                    upcomingShift.day,
                                    " • ",
                                    upcomingShift.startTime,
                                    " - ",
                                    upcomingShift.endTime
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ClockInCard.tsx",
                                lineNumber: 287,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-stone-600 mt-1",
                                children: [
                                    "📍 ",
                                    upcomingShift.venue
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ClockInCard.tsx",
                                lineNumber: 290,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 286,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-stone-500 italic",
                        children: "No upcoming shifts scheduled soon."
                    }, void 0, false, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 293,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 276,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>handleClockAction('in'),
                        disabled: loading || isClockedIn,
                        className: "w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm disabled:opacity-50 transition-all",
                        children: loading ? '...' : 'Clock In'
                    }, void 0, false, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 299,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>handleClockAction('out'),
                        disabled: loading || !isClockedIn,
                        className: "w-full py-3.5 rounded-2xl font-bold text-sm bg-rose-200 hover:bg-rose-300 text-rose-900 shadow-sm disabled:opacity-50 transition-all",
                        children: loading ? '...' : 'Clock Out'
                    }, void 0, false, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 307,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 298,
                columnNumber: 7
            }, this),
            isClockedIn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleBreakToggle,
                        disabled: loading || !breakShift || Boolean(breakShift.endBreak),
                        className: "w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50",
                        children: breakShift?.endBreak ? 'Break Recorded' : breakShift?.startBreak ? 'End Break' : 'Start 30-Minute Break'
                    }, void 0, false, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 318,
                        columnNumber: 11
                    }, this),
                    breakShift?.startBreak && !breakShift.endBreak && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-xs font-semibold text-amber-800",
                        children: [
                            Math.floor(breakSeconds / 60),
                            ":",
                            String(breakSeconds % 60).padStart(2, '0'),
                            " remaining"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 330,
                        columnNumber: 13
                    }, this),
                    !breakShift && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-xs text-amber-800",
                        children: "No scheduled shift is active for a break."
                    }, void 0, false, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 335,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 317,
                columnNumber: 9
            }, this),
            statusMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-3 text-center text-xs font-semibold text-emerald-700",
                children: statusMessage
            }, void 0, false, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 341,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-center text-[11px] text-stone-400 mt-4",
                children: "Onsite location required"
            }, void 0, false, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 344,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ClockInCard.tsx",
        lineNumber: 220,
        columnNumber: 5
    }, this);
}
_s(ClockInCard, "4Nw7Anxb+7RufpoKztLhli9yZaM=");
_c = ClockInCard;
var _c;
__turbopack_context__.k.register(_c, "ClockInCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/DashboardTabs.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardTabs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ClockInCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ClockInCard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$RosterView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/RosterView.tsx [app-client] (ecmascript)");
// import PayslipView from '@/components/PayslipView'; // Hidden pending MYOB integration.
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$BottomNav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/BottomNav.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LeavePanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/LeavePanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$StaffProfile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/StaffProfile.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function DashboardTabs({ userName }) {
    _s();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('clock');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full min-w-0 pb-24",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "w-full",
                children: [
                    activeTab === 'clock' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ClockInCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        userName: userName
                    }, void 0, false, {
                        fileName: "[project]/components/DashboardTabs.tsx",
                        lineNumber: 24,
                        columnNumber: 35
                    }, this),
                    activeTab === 'roster' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$RosterView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/components/DashboardTabs.tsx",
                        lineNumber: 25,
                        columnNumber: 36
                    }, this),
                    activeTab === 'profile' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$StaffProfile$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/components/DashboardTabs.tsx",
                        lineNumber: 27,
                        columnNumber: 37
                    }, this),
                    activeTab === 'leave' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LeavePanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/components/DashboardTabs.tsx",
                        lineNumber: 28,
                        columnNumber: 35
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DashboardTabs.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$BottomNav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                activeTab: activeTab,
                setActiveTab: (tab)=>setActiveTab(tab)
            }, void 0, false, {
                fileName: "[project]/components/DashboardTabs.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DashboardTabs.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_s(DashboardTabs, "79q4DWOgkBtg2YWaayxjlMrE8PM=");
_c = DashboardTabs;
var _c;
__turbopack_context__.k.register(_c, "DashboardTabs");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/LeavePanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LeavePanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$leave$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/leave.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const input = 'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm';
const button = 'rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold disabled:opacity-50';
function groupedRequests(entries) {
    const groups = new Map();
    for (const entry of entries){
        const key = entry.requestGroupId || entry.id;
        const date = entry.workDate.slice(0, 10);
        const current = groups.get(key);
        if (current) {
            current.ids.push(entry.id);
            current.startDate = current.startDate < date ? current.startDate : date;
            current.endDate = current.endDate > date ? current.endDate : date;
            current.days += 1;
            current.totalHours += Number(entry.hours);
        } else groups.set(key, {
            ...entry,
            ids: [
                entry.id
            ],
            startDate: date,
            endDate: date,
            days: 1,
            totalHours: Number(entry.hours)
        });
    }
    return [
        ...groups.values()
    ].sort((a, b)=>b.startDate.localeCompare(a.startDate));
}
/** Hides cancelled leave that was replaced by an edit, so it does not look like a real cancellation. */ function withoutReplaced(groups) {
    const replaced = new Set(groups.filter((group)=>group.replacesId && group.status !== 'REJECTED' && group.status !== 'CANCELLED').map((group)=>group.replacesId));
    return groups.filter((group)=>!(group.status === 'CANCELLED' && group.ids.some((id)=>replaced.has(id))));
}
function displayDate(value) {
    return new Intl.DateTimeFormat('en-AU', {
        timeZone: 'UTC',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(new Date(`${value}T00:00:00Z`));
}
function plusDays(isoDate, days) {
    return new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
}
function callLeaveApi(method, payload) {
    return fetch('/api/leave', {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
}
function StatusBadge({ status }) {
    const tone = status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800' : status === 'REJECTED' ? 'bg-rose-50 text-rose-800' : status === 'CANCELLED' ? 'bg-stone-100 text-stone-600' : 'bg-amber-50 text-amber-900';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `shrink-0 rounded px-2 py-1 text-xs font-semibold ${tone}`,
        children: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$leave$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEAVE_STATUS_LABELS"][status] || status
    }, void 0, false, {
        fileName: "[project]/components/LeavePanel.tsx",
        lineNumber: 78,
        columnNumber: 10
    }, this);
}
_c = StatusBadge;
function LeavePanel({ view = 'employee' }) {
    _s();
    const [staff, setStaff] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [requests, setRequests] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentUserId, setCurrentUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [reviewNotes, setReviewNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [revision, setRevision] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [dialog, setDialog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const manage = view === 'review';
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LeavePanel.useEffect": ()=>{
            const controller = new AbortController();
            async function load() {
                try {
                    const response = await fetch(`/api/leave${manage ? '?view=review' : ''}`, {
                        signal: controller.signal,
                        cache: 'no-store'
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Unable to load leave.');
                    setStaff(data.staff);
                    setRequests(data.requests);
                    setCurrentUserId(data.currentUserId);
                } catch (error) {
                    if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Unable to load leave.');
                } finally{
                    if (!controller.signal.aborted) setLoading(false);
                }
            }
            void load();
            return ({
                "LeavePanel.useEffect": ()=>controller.abort()
            })["LeavePanel.useEffect"];
        }
    }["LeavePanel.useEffect"], [
        revision,
        manage
    ]);
    const selected = staff.find((person)=>person.id === currentUserId);
    const allGroups = groupedRequests(requests);
    const groups = withoutReplaced(allGroups);
    const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Australia/Perth',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
    function openDialog(next) {
        setError('');
        setMessage('');
        setDialog(next);
    }
    const summary = (entry)=>`${entry.totalHours.toFixed(2)} hours of ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$leave$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEAVE_LABELS"][entry.type]} for ${entry.user.name || 'staff'} (${displayDate(entry.startDate)} - ${displayDate(entry.endDate)})`;
    async function patchLeave(payload, confirmText) {
        if (!window.confirm(confirmText)) return;
        setBusy(true);
        setMessage('');
        setError('');
        try {
            const response = await callLeaveApi('PATCH', payload);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unable to update leave.');
            setMessage(data.message);
            setRevision((value)=>value + 1);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Unable to update leave.');
        } finally{
            setBusy(false);
        }
    }
    function review(entry, status) {
        const what = entry.status === 'CANCEL_REQUESTED' ? 'cancellation of' : entry.replacesId ? 'change to' : '';
        const verb = status === 'APPROVED' ? 'Approve' : entry.status === 'CANCEL_REQUESTED' ? 'Decline' : 'Do not approve';
        return patchLeave({
            action: 'review',
            id: entry.id,
            status,
            reviewNote: reviewNotes[entry.id] || ''
        }, `${verb} ${what} ${summary(entry)}?`.replace('  ', ' '));
    }
    const changeNote = (entry)=>{
        if (!entry.replacesId || entry.status !== 'PENDING') return null;
        const original = allGroups.find((group)=>group.ids.includes(entry.replacesId));
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "mt-1 text-xs font-medium text-amber-900",
            children: [
                "Change to leave on ",
                original ? `${displayDate(original.startDate)} - ${displayDate(original.endDate)}` : 'earlier request'
            ]
        }, void 0, true, {
            fileName: "[project]/components/LeavePanel.tsx",
            lineNumber: 143,
            columnNumber: 12
        }, this);
    };
    const staffActions = (entry)=>{
        if (entry.status === 'PENDING') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    disabled: busy,
                    className: button,
                    onClick: ()=>patchLeave({
                            action: 'withdraw',
                            id: entry.id
                        }, 'Withdraw this request?'),
                    children: "Withdraw"
                }, void 0, false, {
                    fileName: "[project]/components/LeavePanel.tsx",
                    lineNumber: 148,
                    columnNumber: 36
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 148,
                columnNumber: 14
            }, this);
        }
        if (entry.status === 'APPROVED' && entry.endDate >= today) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 flex flex-wrap gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        disabled: busy,
                        className: button,
                        onClick: ()=>openDialog({
                                mode: 'change',
                                entry
                            }),
                        children: "Change dates"
                    }, void 0, false, {
                        fileName: "[project]/components/LeavePanel.tsx",
                        lineNumber: 152,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        disabled: busy,
                        className: `${button} text-rose-700`,
                        onClick: ()=>patchLeave({
                                action: 'request-cancel',
                                id: entry.id
                            }, 'Ask your manager to cancel this leave? It stays approved until they agree.'),
                        children: "Request cancellation"
                    }, void 0, false, {
                        fileName: "[project]/components/LeavePanel.tsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 151,
                columnNumber: 14
            }, this);
        }
        if (entry.status === 'CANCEL_REQUESTED') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-3 text-xs text-stone-500",
                children: "Waiting for your manager. This leave stays approved until they agree to cancel it."
            }, void 0, false, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 157,
                columnNumber: 14
            }, this);
        }
        return null;
    };
    const section = (title, entries)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "space-y-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-lg font-semibold",
                    children: title
                }, void 0, false, {
                    fileName: "[project]/components/LeavePanel.tsx",
                    lineNumber: 164,
                    columnNumber: 7
                }, this),
                !entries.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-stone-500",
                    children: [
                        "No ",
                        title.toLowerCase(),
                        "."
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LeavePanel.tsx",
                    lineNumber: 165,
                    columnNumber: 27
                }, this),
                entries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                        className: "rounded-lg border border-stone-200 bg-white p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "min-w-0 text-sm font-semibold",
                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$leave$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEAVE_LABELS"][entry.type]
                                    }, void 0, false, {
                                        fileName: "[project]/components/LeavePanel.tsx",
                                        lineNumber: 167,
                                        columnNumber: 65
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusBadge, {
                                        status: entry.status
                                    }, void 0, false, {
                                        fileName: "[project]/components/LeavePanel.tsx",
                                        lineNumber: 167,
                                        columnNumber: 142
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/LeavePanel.tsx",
                                lineNumber: 167,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-sm text-stone-600",
                                children: [
                                    displayDate(entry.startDate),
                                    " - ",
                                    displayDate(entry.endDate)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/LeavePanel.tsx",
                                lineNumber: 168,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs text-stone-500",
                                children: [
                                    entry.days,
                                    " ",
                                    entry.days === 1 ? 'day' : 'days',
                                    " · ",
                                    entry.totalHours.toFixed(2),
                                    " hours"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/LeavePanel.tsx",
                                lineNumber: 169,
                                columnNumber: 9
                            }, this),
                            changeNote(entry),
                            entry.note && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-3 break-words text-sm text-stone-600",
                                children: entry.note
                            }, void 0, false, {
                                fileName: "[project]/components/LeavePanel.tsx",
                                lineNumber: 171,
                                columnNumber: 24
                            }, this),
                            entry.reviewNote && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 break-words text-sm text-stone-600",
                                children: [
                                    "Manager: ",
                                    entry.reviewNote
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/LeavePanel.tsx",
                                lineNumber: 172,
                                columnNumber: 30
                            }, this),
                            staffActions(entry)
                        ]
                    }, entry.id, true, {
                        fileName: "[project]/components/LeavePanel.tsx",
                        lineNumber: 166,
                        columnNumber: 31
                    }, this))
            ]
        }, void 0, true, {
            fileName: "[project]/components/LeavePanel.tsx",
            lineNumber: 163,
            columnNumber: 5
        }, this);
    const adminActions = (entry)=>{
        const needsReview = entry.status === 'PENDING' || entry.status === 'CANCEL_REQUESTED';
        if (entry.userId === currentUserId) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-stone-500",
                children: needsReview ? 'Another manager must review' : entry.reviewedAt?.slice(0, 10)
            }, void 0, false, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 181,
                columnNumber: 14
            }, this);
        }
        const cancelling = entry.status === 'CANCEL_REQUESTED';
        const canEdit = entry.status === 'PENDING' || entry.status === 'APPROVED';
        if (!needsReview && !canEdit) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "text-xs text-stone-500",
            children: entry.reviewedAt?.slice(0, 10)
        }, void 0, false, {
            fileName: "[project]/components/LeavePanel.tsx",
            lineNumber: 185,
            columnNumber: 42
        }, this);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "space-y-2",
            children: [
                needsReview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            "aria-label": `Review note for ${entry.user.name || 'staff'}`,
                            placeholder: "Review note",
                            maxLength: 2000,
                            value: reviewNotes[entry.id] || '',
                            onChange: (event)=>setReviewNotes((current)=>({
                                        ...current,
                                        [entry.id]: event.target.value
                                    })),
                            className: input
                        }, void 0, false, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 188,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    disabled: busy,
                                    className: `${button} text-emerald-800`,
                                    onClick: ()=>review(entry, 'APPROVED'),
                                    children: cancelling ? 'Approve cancellation' : 'Approve'
                                }, void 0, false, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 190,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    disabled: busy,
                                    className: `${button} text-rose-700`,
                                    onClick: ()=>review(entry, 'REJECTED'),
                                    children: cancelling ? 'Keep leave' : 'Not approve'
                                }, void 0, false, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 191,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 189,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LeavePanel.tsx",
                    lineNumber: 187,
                    columnNumber: 23
                }, this),
                canEdit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            disabled: busy,
                            className: button,
                            onClick: ()=>openDialog({
                                    mode: 'edit',
                                    entry
                                }),
                            children: "Edit"
                        }, void 0, false, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 195,
                            columnNumber: 9
                        }, this),
                        entry.status === 'APPROVED' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            disabled: busy,
                            className: `${button} text-rose-700`,
                            onClick: ()=>patchLeave({
                                    action: 'cancel',
                                    id: entry.id,
                                    reviewNote: reviewNotes[entry.id] || ''
                                }, `Cancel ${summary(entry)} and return the hours?`),
                            children: "Cancel leave"
                        }, void 0, false, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 196,
                            columnNumber: 41
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LeavePanel.tsx",
                    lineNumber: 194,
                    columnNumber: 19
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/LeavePanel.tsx",
            lineNumber: 186,
            columnNumber: 12
        }, this);
    };
    const visible = groups.filter((entry)=>!statusFilter || entry.status === statusFilter);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `min-w-0 w-full space-y-6 text-left text-stone-900 ${manage ? '' : 'mx-auto max-w-md'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex items-center justify-between gap-3 border-b border-stone-200 pb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-semibold",
                        children: manage ? 'Leave Requests' : 'My Leave'
                    }, void 0, false, {
                        fileName: "[project]/components/LeavePanel.tsx",
                        lineNumber: 205,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>openDialog(manage ? {
                                mode: 'create'
                            } : {
                                mode: 'request'
                            }),
                        disabled: loading || !manage && !selected,
                        className: `${button} shrink-0 bg-emerald-700 text-white hover:bg-emerald-800`,
                        children: manage ? 'Create leave' : 'Request leave'
                    }, void 0, false, {
                        fileName: "[project]/components/LeavePanel.tsx",
                        lineNumber: 206,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 204,
                columnNumber: 5
            }, this),
            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900",
                children: message
            }, void 0, false, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 208,
                columnNumber: 17
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                className: "rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 209,
                columnNumber: 15
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "py-5 text-sm text-stone-500",
                children: "Loading leave..."
            }, void 0, false, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 210,
                columnNumber: 16
            }, this) : manage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block max-w-xs text-sm font-medium",
                        children: [
                            "Status",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: `${input} mt-1`,
                                value: statusFilter,
                                onChange: (event)=>setStatusFilter(event.target.value),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "All statuses"
                                    }, void 0, false, {
                                        fileName: "[project]/components/LeavePanel.tsx",
                                        lineNumber: 212,
                                        columnNumber: 9
                                    }, this),
                                    Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$leave$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEAVE_STATUS_LABELS"]).map(([value, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: value,
                                            children: label
                                        }, value, false, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 212,
                                            columnNumber: 108
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/LeavePanel.tsx",
                                lineNumber: 211,
                                columnNumber: 67
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/LeavePanel.tsx",
                        lineNumber: 211,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-w-full overflow-x-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                className: "w-full min-w-[700px] text-left text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                        className: "border-b border-stone-200 bg-stone-50",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                'Staff / period',
                                                'Leave / hours',
                                                'Status / notes',
                                                'Actions'
                                            ].map((label)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "p-3",
                                                    children: label
                                                }, label, false, {
                                                    fileName: "[project]/components/LeavePanel.tsx",
                                                    lineNumber: 216,
                                                    columnNumber: 153
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 216,
                                            columnNumber: 68
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/LeavePanel.tsx",
                                        lineNumber: 216,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        children: visible.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "border-b border-stone-200 align-top",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3 font-medium",
                                                        children: [
                                                            entry.user.name || 'Unnamed staff',
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-1 text-xs font-normal text-stone-500",
                                                                children: [
                                                                    displayDate(entry.startDate),
                                                                    " - ",
                                                                    displayDate(entry.endDate)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/LeavePanel.tsx",
                                                                lineNumber: 218,
                                                                columnNumber: 81
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/LeavePanel.tsx",
                                                        lineNumber: 218,
                                                        columnNumber: 13
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3",
                                                        children: [
                                                            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$leave$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEAVE_LABELS"][entry.type],
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-1 text-xs text-stone-500",
                                                                children: [
                                                                    entry.days,
                                                                    " ",
                                                                    entry.days === 1 ? 'day' : 'days',
                                                                    " · ",
                                                                    entry.totalHours.toFixed(2),
                                                                    " hours"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/LeavePanel.tsx",
                                                                lineNumber: 219,
                                                                columnNumber: 59
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/LeavePanel.tsx",
                                                        lineNumber: 219,
                                                        columnNumber: 13
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "max-w-xs break-words p-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusBadge, {
                                                                status: entry.status
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/LeavePanel.tsx",
                                                                lineNumber: 220,
                                                                columnNumber: 54
                                                            }, this),
                                                            changeNote(entry),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "mt-2",
                                                                children: entry.note
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/LeavePanel.tsx",
                                                                lineNumber: 220,
                                                                columnNumber: 110
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                children: entry.reviewNote
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/LeavePanel.tsx",
                                                                lineNumber: 220,
                                                                columnNumber: 146
                                                            }, this),
                                                            entry.reviewer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "mt-1 text-xs text-stone-500",
                                                                children: [
                                                                    "Reviewed by ",
                                                                    entry.reviewer.name || 'Manager'
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/LeavePanel.tsx",
                                                                lineNumber: 220,
                                                                columnNumber: 190
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/LeavePanel.tsx",
                                                        lineNumber: 220,
                                                        columnNumber: 13
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3",
                                                        children: adminActions(entry)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/LeavePanel.tsx",
                                                        lineNumber: 221,
                                                        columnNumber: 13
                                                    }, this)
                                                ]
                                            }, entry.id, true, {
                                                fileName: "[project]/components/LeavePanel.tsx",
                                                lineNumber: 217,
                                                columnNumber: 42
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/LeavePanel.tsx",
                                        lineNumber: 217,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/LeavePanel.tsx",
                                lineNumber: 215,
                                columnNumber: 9
                            }, this),
                            !visible.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "py-6 text-sm text-stone-500",
                                children: "No leave requests for this status."
                            }, void 0, false, {
                                fileName: "[project]/components/LeavePanel.tsx",
                                lineNumber: 224,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/LeavePanel.tsx",
                        lineNumber: 214,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 210,
                columnNumber: 91
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 gap-4 border-b border-stone-200 pb-5",
                        children: selected.employmentType === 'FULL_TIME' || selected.employmentType === 'PART_TIME' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-stone-500",
                                            children: "Annual leave balance"
                                        }, void 0, false, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 229,
                                            columnNumber: 16
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-1 text-lg font-semibold",
                                            children: [
                                                selected.annualLeaveHours,
                                                " h"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 229,
                                            columnNumber: 78
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 229,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-stone-500",
                                            children: "Personal leave balance"
                                        }, void 0, false, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 230,
                                            columnNumber: 16
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-1 text-lg font-semibold",
                                            children: [
                                                selected.personalLeaveHours,
                                                " h"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 230,
                                            columnNumber: 80
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 230,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 228,
                            columnNumber: 95
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "col-span-2 text-sm text-stone-500",
                            children: "Paid leave entitlement: None"
                        }, void 0, false, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 231,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/LeavePanel.tsx",
                        lineNumber: 227,
                        columnNumber: 20
                    }, this),
                    section('My requests', groups.filter((entry)=>entry.status === 'PENDING')),
                    section('Scheduled', groups.filter((entry)=>(entry.status === 'APPROVED' || entry.status === 'CANCEL_REQUESTED') && entry.endDate >= today)),
                    section('History', groups.filter((entry)=>entry.status === 'REJECTED' || entry.status === 'CANCELLED' || (entry.status === 'APPROVED' || entry.status === 'CANCEL_REQUESTED') && entry.endDate < today))
                ]
            }, void 0, true, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 226,
                columnNumber: 11
            }, this),
            dialog && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LeaveDialog, {
                state: dialog,
                staff: staff,
                currentUserId: currentUserId,
                today: today,
                onClose: ()=>setDialog(null),
                onSubmitted: (text)=>{
                    setMessage(text);
                    setDialog(null);
                    setRevision((value)=>value + 1);
                }
            }, `${dialog.mode}-${'entry' in dialog ? dialog.entry.id : ''}`, false, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 237,
                columnNumber: 16
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/LeavePanel.tsx",
        lineNumber: 203,
        columnNumber: 10
    }, this);
}
_s(LeavePanel, "vxqLX+ts2cmfipuBj1RTuguIoWc=");
_c1 = LeavePanel;
const DIALOG_TEXT = {
    request: {
        title: 'Request leave',
        send: 'Send',
        help: ''
    },
    create: {
        title: 'Create leave for staff',
        send: 'Create leave',
        help: 'Approved straight away, and paid leave comes off their balance.'
    },
    change: {
        title: 'Change leave dates',
        send: 'Send change for approval',
        help: 'Your current leave stays approved until a manager approves this change.'
    },
    edit: {
        title: 'Edit leave',
        send: 'Save changes',
        help: 'Applies straight away. The balance is adjusted by the difference.'
    }
};
function LeaveDialog({ state, staff, currentUserId, today, onClose, onSubmitted }) {
    _s1();
    const entry = state.mode === 'change' || state.mode === 'edit' ? state.entry : null;
    const [userId, setUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const person = state.mode === 'create' ? staff.find((item)=>item.id === userId) : staff.find((item)=>item.id === (entry ? entry.userId : currentUserId));
    const entitled = person?.employmentType === 'FULL_TIME' || person?.employmentType === 'PART_TIME';
    const [chosenType, setChosenType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(entry?.type ?? 'ANNUAL');
    const type = entitled ? chosenType : 'UNPAID';
    const [startDate, setStartDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(entry?.startDate ?? '');
    const [endDate, setEndDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(entry?.endDate ?? '');
    const [hours, setHours] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(entry ? String(Number(entry.hours)) : '7.5');
    const [note, setNote] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(entry?.note ?? '');
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const dialog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LeaveDialog.useEffect": ()=>{
            const element = dialog.current;
            element?.showModal();
            return ({
                "LeaveDialog.useEffect": ()=>element?.close()
            })["LeaveDialog.useEffect"];
        }
    }["LeaveDialog.useEffect"], []);
    const text = DIALOG_TEXT[state.mode];
    const staffMode = state.mode === 'request' || state.mode === 'change';
    const minStart = staffMode && type === 'ANNUAL' ? plusDays(today, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$leave$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ANNUAL_NOTICE_DAYS"]) : undefined;
    let days = 0;
    try {
        days = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$leave$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["leavePeriod"])(startDate, endDate).length;
    } catch  {}
    const totalHours = days * Number(hours);
    async function submit(event) {
        event.preventDefault();
        setError('');
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$leave$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["leavePeriod"])(startDate, endDate);
            if (state.mode === 'create' && !userId) throw new Error('Choose a staff member.');
            setBusy(true);
            const payload = {
                startDate,
                endDate,
                type,
                hours,
                note
            };
            const response = state.mode === 'edit' ? await callLeaveApi('PATCH', {
                ...payload,
                action: 'edit',
                id: entry?.id
            }) : state.mode === 'create' ? await callLeaveApi('POST', {
                ...payload,
                userId
            }) : state.mode === 'change' ? await callLeaveApi('POST', {
                ...payload,
                replacesId: entry?.id
            }) : await callLeaveApi('POST', payload);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unable to save leave.');
            onSubmitted(data.message);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Unable to save leave.');
        } finally{
            setBusy(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dialog", {
        ref: dialog,
        onCancel: (event)=>{
            event.preventDefault();
            if (!busy) onClose();
        },
        "aria-labelledby": "leave-dialog-title",
        className: "m-auto flex h-[min(42rem,calc(100dvh_-_2rem))] w-[calc(100%_-_2rem)] max-w-md flex-col rounded-lg bg-white p-5 text-stone-900 shadow-xl backdrop:bg-black/40",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            onSubmit: submit,
            className: "flex min-h-0 flex-1 flex-col",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "mb-5 flex items-center justify-between gap-3 border-b border-stone-200 pb-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            id: "leave-dialog-title",
                            className: "text-lg font-semibold",
                            children: text.title
                        }, void 0, false, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 297,
                            columnNumber: 103
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: onClose,
                            disabled: busy,
                            className: "px-2 py-1 text-sm text-stone-600",
                            children: "Close"
                        }, void 0, false, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 297,
                            columnNumber: 182
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LeavePanel.tsx",
                    lineNumber: 297,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "min-h-0 flex-1 space-y-4 overflow-y-auto",
                    children: [
                        text.help && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-stone-600",
                            children: text.help
                        }, void 0, false, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 299,
                            columnNumber: 23
                        }, this),
                        state.mode === 'create' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-sm font-medium",
                            children: [
                                "Staff member",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    required: true,
                                    value: userId,
                                    onChange: (event)=>setUserId(event.target.value),
                                    disabled: busy,
                                    className: `${input} mt-1`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: "Choose staff"
                                        }, void 0, false, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 301,
                                            columnNumber: 11
                                        }, this),
                                        staff.filter((item)=>item.id !== currentUserId).map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: item.id,
                                                children: item.name || 'Unnamed staff'
                                            }, item.id, false, {
                                                fileName: "[project]/components/LeavePanel.tsx",
                                                lineNumber: 302,
                                                columnNumber: 76
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 300,
                                    columnNumber: 94
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 300,
                            columnNumber: 37
                        }, this),
                        entry && state.mode === 'edit' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium",
                            children: entry.user.name || 'Unnamed staff'
                        }, void 0, false, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 304,
                            columnNumber: 44
                        }, this),
                        !staffMode && person && (entitled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-stone-500",
                            children: [
                                "Balances: annual ",
                                person.annualLeaveHours,
                                " h, personal ",
                                person.personalLeaveHours,
                                " h"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 306,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-stone-500",
                            children: "No paid leave entitlement, so unpaid leave only."
                        }, void 0, false, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 307,
                            columnNumber: 13
                        }, this)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-sm font-medium",
                            children: [
                                "Leave type",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: type,
                                    onChange: (event)=>setChosenType(event.target.value),
                                    disabled: busy,
                                    className: `${input} mt-1`,
                                    children: [
                                        entitled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "ANNUAL",
                                                    children: "Annual leave"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/LeavePanel.tsx",
                                                    lineNumber: 309,
                                                    columnNumber: 26
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "PERSONAL",
                                                    children: "Personal leave"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/LeavePanel.tsx",
                                                    lineNumber: 309,
                                                    columnNumber: 70
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 309,
                                            columnNumber: 24
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "UNPAID",
                                            children: "Unpaid leave"
                                        }, void 0, false, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 309,
                                            columnNumber: 122
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 308,
                                    columnNumber: 64
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 308,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "min-w-0 text-sm font-medium",
                                    children: [
                                        "Start date",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            required: true,
                                            type: "date",
                                            min: minStart,
                                            value: startDate,
                                            onChange: (event)=>{
                                                const value = event.target.value;
                                                setStartDate(value);
                                                if (!endDate || endDate < value) setEndDate(value);
                                            },
                                            disabled: busy,
                                            className: `${input} mt-1 min-w-0`
                                        }, void 0, false, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 312,
                                            columnNumber: 68
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 312,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "min-w-0 text-sm font-medium",
                                    children: [
                                        "End date",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            required: true,
                                            type: "date",
                                            min: startDate,
                                            value: endDate,
                                            onChange: (event)=>setEndDate(event.target.value),
                                            disabled: busy,
                                            className: `${input} mt-1 min-w-0`
                                        }, void 0, false, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 313,
                                            columnNumber: 66
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 313,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 311,
                            columnNumber: 9
                        }, this),
                        minStart && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-stone-500",
                            children: [
                                "Annual leave needs at least ",
                                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$leave$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ANNUAL_NOTICE_DAYS"],
                                " days of notice, so the earliest start is ",
                                displayDate(minStart),
                                "."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 315,
                            columnNumber: 22
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-sm font-medium",
                            children: [
                                "Hours per day",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    required: true,
                                    type: "number",
                                    min: "0.01",
                                    max: "24",
                                    step: "0.01",
                                    value: hours,
                                    onChange: (event)=>setHours(event.target.value),
                                    disabled: busy,
                                    className: `${input} mt-1`
                                }, void 0, false, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 316,
                                    columnNumber: 67
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 316,
                            columnNumber: 9
                        }, this),
                        days > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-stone-600",
                            children: [
                                days,
                                " calendar ",
                                days === 1 ? 'day' : 'days',
                                " (including weekends) · ",
                                Number.isFinite(totalHours) ? totalHours.toFixed(2) : '0.00',
                                " hours total"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 317,
                            columnNumber: 22
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "block text-sm font-medium",
                            children: [
                                "Note",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    maxLength: 2000,
                                    value: note,
                                    onChange: (event)=>setNote(event.target.value),
                                    disabled: busy,
                                    rows: 3,
                                    className: `${input} mt-1 resize-y`
                                }, void 0, false, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 318,
                                    columnNumber: 58
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 318,
                            columnNumber: 9
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            role: "alert",
                            className: "rounded-md bg-rose-50 p-3 text-sm text-rose-800",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 319,
                            columnNumber: 19
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LeavePanel.tsx",
                    lineNumber: 298,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    disabled: busy,
                    className: "mt-5 w-full rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50",
                    children: busy ? 'Saving...' : text.send
                }, void 0, false, {
                    fileName: "[project]/components/LeavePanel.tsx",
                    lineNumber: 321,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/LeavePanel.tsx",
            lineNumber: 296,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/LeavePanel.tsx",
        lineNumber: 295,
        columnNumber: 10
    }, this);
}
_s1(LeaveDialog, "R7ztDdGzZQIVoyTwc+z7pFcbs9Q=");
_c2 = LeaveDialog;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "StatusBadge");
__turbopack_context__.k.register(_c1, "LeavePanel");
__turbopack_context__.k.register(_c2, "LeaveDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/LogoutButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LogoutButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function LogoutButton({ children }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    async function handleLogout() {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error('Logout request failed');
            }
            await queryClient.cancelQueries();
            queryClient.clear();
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
        } finally{
            setLoading(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: handleLogout,
        disabled: loading,
        className: "w-full px-3 py-2 text-xs rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 transition-colors disabled:opacity-60",
        children: loading ? 'Logging out...' : children
    }, void 0, false, {
        fileName: "[project]/components/LogoutButton.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
_s(LogoutButton, "kX1VxpnXz391i4goJed15R5/zRg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"]
    ];
});
_c = LogoutButton;
var _c;
__turbopack_context__.k.register(_c, "LogoutButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/RosterView.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RosterView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
const ORDER = {
    holiday: 0,
    leave: 1,
    shift: 2
};
function RosterView() {
    _s();
    const [entries, setEntries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RosterView.useEffect": ()=>{
            async function fetchRoster() {
                try {
                    const res = await fetch('/api/roster/mine');
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed to fetch shifts');
                    const shifts = Array.isArray(data.shifts) ? data.shifts : [];
                    const leave = Array.isArray(data.leave) ? data.leave : [];
                    const holidays = Array.isArray(data.holidays) ? data.holidays : [];
                    const merged = [
                        ...holidays.map({
                            "RosterView.useEffect.fetchRoster.merged": (h)=>({
                                    kind: 'holiday',
                                    key: `h-${h.date}`,
                                    date: h.date,
                                    data: h
                                })
                        }["RosterView.useEffect.fetchRoster.merged"]),
                        ...leave.map({
                            "RosterView.useEffect.fetchRoster.merged": (l)=>({
                                    kind: 'leave',
                                    key: `l-${l.id}`,
                                    date: l.date,
                                    data: l
                                })
                        }["RosterView.useEffect.fetchRoster.merged"]),
                        ...shifts.map({
                            "RosterView.useEffect.fetchRoster.merged": (s)=>({
                                    kind: 'shift',
                                    key: `s-${s.id}`,
                                    date: s.date,
                                    data: s
                                })
                        }["RosterView.useEffect.fetchRoster.merged"])
                    ].sort({
                        "RosterView.useEffect.fetchRoster.merged": (a, b)=>a.date.localeCompare(b.date) || ORDER[a.kind] - ORDER[b.kind]
                    }["RosterView.useEffect.fetchRoster.merged"]);
                    setEntries(merged);
                } catch (err) {
                    setError(err.message || 'Error loading roster');
                } finally{
                    setLoading(false);
                }
            }
            fetchRoster();
        }
    }["RosterView.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full bg-white border border-stone-200 rounded-3xl p-6 shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-lg font-serif font-bold text-stone-800 mb-1",
                children: "Upcoming Roster"
            }, void 0, false, {
                fileName: "[project]/components/RosterView.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-stone-500 mb-4",
                children: "Your shifts, leave and WA public holidays"
            }, void 0, false, {
                fileName: "[project]/components/RosterView.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-center text-xs text-stone-400 py-4",
                children: "Loading shifts..."
            }, void 0, false, {
                fileName: "[project]/components/RosterView.tsx",
                lineNumber: 53,
                columnNumber: 19
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-center text-xs text-rose-500 py-4",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/RosterView.tsx",
                lineNumber: 54,
                columnNumber: 17
            }, this),
            !loading && !error && entries.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-6 bg-stone-50 rounded-2xl border border-stone-100 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-medium text-stone-500",
                        children: "No shifts scheduled"
                    }, void 0, false, {
                        fileName: "[project]/components/RosterView.tsx",
                        lineNumber: 58,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[11px] text-stone-400 mt-1",
                        children: "Check back later for updates"
                    }, void 0, false, {
                        fileName: "[project]/components/RosterView.tsx",
                        lineNumber: 59,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/RosterView.tsx",
                lineNumber: 57,
                columnNumber: 9
            }, this),
            !loading && !error && entries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: entries.map((entry)=>{
                    if (entry.kind === 'holiday') {
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100 flex justify-between items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] font-bold text-indigo-400 uppercase tracking-wider",
                                            children: entry.data.day
                                        }, void 0, false, {
                                            fileName: "[project]/components/RosterView.tsx",
                                            lineNumber: 70,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-semibold text-indigo-900",
                                            children: entry.data.name
                                        }, void 0, false, {
                                            fileName: "[project]/components/RosterView.tsx",
                                            lineNumber: 71,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/RosterView.tsx",
                                    lineNumber: 69,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs font-bold bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full",
                                    children: "Public holiday"
                                }, void 0, false, {
                                    fileName: "[project]/components/RosterView.tsx",
                                    lineNumber: 73,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, entry.key, true, {
                            fileName: "[project]/components/RosterView.tsx",
                            lineNumber: 68,
                            columnNumber: 17
                        }, this);
                    }
                    if (entry.kind === 'leave') {
                        const confirmed = entry.data.status === 'APPROVED';
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `p-3.5 bg-emerald-50 rounded-2xl border flex justify-between items-center ${confirmed ? 'border-emerald-200' : 'border-dashed border-emerald-300'}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] font-bold text-emerald-500 uppercase tracking-wider",
                                            children: entry.data.day
                                        }, void 0, false, {
                                            fileName: "[project]/components/RosterView.tsx",
                                            lineNumber: 88,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-semibold text-emerald-900",
                                            children: entry.data.type
                                        }, void 0, false, {
                                            fileName: "[project]/components/RosterView.tsx",
                                            lineNumber: 89,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/RosterView.tsx",
                                    lineNumber: 87,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full",
                                    children: confirmed ? 'On leave' : entry.data.statusLabel
                                }, void 0, false, {
                                    fileName: "[project]/components/RosterView.tsx",
                                    lineNumber: 91,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, entry.key, true, {
                            fileName: "[project]/components/RosterView.tsx",
                            lineNumber: 81,
                            columnNumber: 17
                        }, this);
                    }
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-3.5 bg-stone-50 rounded-2xl border border-stone-100 flex justify-between items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] font-bold text-stone-400 uppercase tracking-wider",
                                        children: entry.data.day
                                    }, void 0, false, {
                                        fileName: "[project]/components/RosterView.tsx",
                                        lineNumber: 101,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold text-stone-800",
                                        children: entry.data.venue
                                    }, void 0, false, {
                                        fileName: "[project]/components/RosterView.tsx",
                                        lineNumber: 102,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/RosterView.tsx",
                                lineNumber: 100,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full",
                                children: [
                                    entry.data.startTime,
                                    " - ",
                                    entry.data.endTime
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/RosterView.tsx",
                                lineNumber: 104,
                                columnNumber: 17
                            }, this)
                        ]
                    }, entry.key, true, {
                        fileName: "[project]/components/RosterView.tsx",
                        lineNumber: 99,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/components/RosterView.tsx",
                lineNumber: 64,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/RosterView.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
_s(RosterView, "VXxnBTQjStzwAeJpYl63scOGlic=");
_c = RosterView;
var _c;
__turbopack_context__.k.register(_c, "RosterView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/StaffProfile.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StaffListPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AccountRoleButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/AccountRoleButton.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
// Active staff first, then anyone pending, then inactive staff at the bottom.
const STATUS_ORDER = {
    ACTIVE: 0,
    PENDING: 1,
    INACTIVE: 2
};
const statusBadgeClass = (status)=>status === 'ACTIVE' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : status === 'INACTIVE' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-amber-200 bg-amber-50 text-amber-700';
function StaffListPage() {
    _s();
    const [staffList, setStaffList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [savingId, setSavingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [canManageRoles, setCanManageRoles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('ACTIVE');
    const query = search.trim().toLowerCase();
    const filteredStaff = staffList.filter((staff)=>(statusFilter === 'ALL' || staff.status === statusFilter) && (staff.name || 'Unnamed Staff').toLowerCase().includes(query)).sort((a, b)=>(STATUS_ORDER[a.status] ?? 1) - (STATUS_ORDER[b.status] ?? 1) || (a.name || '').localeCompare(b.name || ''));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StaffListPage.useEffect": ()=>{
            async function fetchStaff() {
                try {
                    const [res, sessionResponse] = await Promise.all([
                        fetch('/api/users'),
                        fetch('/api/auth/me')
                    ]);
                    const data = await res.json();
                    const sessionData = await sessionResponse.json();
                    if (!res.ok) throw new Error(data.error || 'Failed to load staff.');
                    if (!sessionResponse.ok) throw new Error(sessionData.error || 'Failed to load account permissions.');
                    if (!Array.isArray(data)) throw new Error('Invalid staff response.');
                    setStaffList(data);
                    setCanManageRoles(sessionData.user?.role === 'ADMIN');
                } catch (err) {
                    console.error('Failed to load staff list', err);
                    setMessage(err instanceof Error ? err.message : 'Failed to load staff list.');
                } finally{
                    setLoading(false);
                }
            }
            fetchStaff();
        }
    }["StaffListPage.useEffect"], []);
    const updateLocation = async (userId, location)=>{
        setSavingId(userId);
        setMessage('');
        try {
            const response = await fetch('/api/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    location
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update venue');
            setStaffList((current)=>current.map((staff)=>staff.id === userId ? {
                        ...staff,
                        location: data.location
                    } : staff));
            setMessage('Venue updated.');
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Failed to update venue.');
        } finally{
            setSavingId(null);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mx-auto max-w-5xl space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between border-b border-stone-200 pb-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs font-bold uppercase tracking-widest text-stone-500",
                            children: "Admin Panel"
                        }, void 0, false, {
                            fileName: "[project]/components/StaffProfile.tsx",
                            lineNumber: 94,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "mt-1 text-2xl font-bold text-stone-900",
                            children: "Staff Profiles"
                        }, void 0, false, {
                            fileName: "[project]/components/StaffProfile.tsx",
                            lineNumber: 97,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/StaffProfile.tsx",
                    lineNumber: 93,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/StaffProfile.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "text-sm text-stone-600",
                children: message
            }, void 0, false, {
                fileName: "[project]/components/StaffProfile.tsx",
                lineNumber: 101,
                columnNumber: 19
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "grid gap-1 text-sm font-medium text-stone-700 sm:w-80",
                        children: [
                            "Search staff name",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "search",
                                value: search,
                                onChange: (event)=>setSearch(event.target.value),
                                placeholder: "Search by name...",
                                className: "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                            }, void 0, false, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 106,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/StaffProfile.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "grid gap-1 text-sm font-medium text-stone-700",
                        children: [
                            "Staff status",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: statusFilter,
                                onChange: (event)=>setStatusFilter(event.target.value),
                                className: "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "ACTIVE",
                                        children: "Show Active"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 115,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "INACTIVE",
                                        children: "Show Inactive"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 116,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "ALL",
                                        children: "Show All"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 117,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 113,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/StaffProfile.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/StaffProfile.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs",
                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "p-6 text-sm text-stone-500",
                    children: "Loading staff members..."
                }, void 0, false, {
                    fileName: "[project]/components/StaffProfile.tsx",
                    lineNumber: 124,
                    columnNumber: 11
                }, this) : staffList.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "p-6 text-sm text-stone-500",
                    children: "No staff members found."
                }, void 0, false, {
                    fileName: "[project]/components/StaffProfile.tsx",
                    lineNumber: 126,
                    columnNumber: 11
                }, this) : filteredStaff.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    role: "status",
                    className: "p-6 text-sm text-stone-500",
                    children: "No staff members match your search and status filter."
                }, void 0, false, {
                    fileName: "[project]/components/StaffProfile.tsx",
                    lineNumber: 128,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full text-left text-sm text-stone-700",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "border-b border-stone-200 bg-stone-50 text-xs font-bold uppercase tracking-wide text-stone-500",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-3",
                                        children: "Name"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 133,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-3",
                                        children: "Email"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 134,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-3",
                                        children: "Location"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 135,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-3",
                                        children: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 136,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-6 py-3 text-right",
                                        children: "Action"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 137,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 132,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/StaffProfile.tsx",
                            lineNumber: 131,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            className: "divide-y divide-stone-100",
                            children: filteredStaff.map((staff, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        statusFilter === 'ALL' && staff.status === 'INACTIVE' && index > 0 && filteredStaff[index - 1].status !== 'INACTIVE' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                colSpan: 5,
                                                className: "bg-stone-50 px-6 py-2 text-xs font-bold uppercase tracking-wide text-stone-500",
                                                children: "Inactive staff"
                                            }, void 0, false, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 147,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/StaffProfile.tsx",
                                            lineNumber: 146,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "hover:bg-stone-50/80 transition",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4 font-semibold text-stone-900",
                                                    children: staff.name || 'Unnamed Staff'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/StaffProfile.tsx",
                                                    lineNumber: 153,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4 text-stone-600",
                                                    children: staff.email || '-'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/StaffProfile.tsx",
                                                    lineNumber: 156,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        "aria-label": `Venue for ${staff.name || 'unnamed staff'}`,
                                                        value: staff.location?.code || '',
                                                        disabled: savingId === staff.id,
                                                        onChange: (event)=>updateLocation(staff.id, event.target.value),
                                                        className: "rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm disabled:opacity-60",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "",
                                                                children: "Unassigned"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 165,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "SHA",
                                                                children: "Sha Patisserie"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 166,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "ZB",
                                                                children: "Zushi Bento"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 167,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 158,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/StaffProfile.tsx",
                                                    lineNumber: 157,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(staff.status)}`,
                                                        children: staff.status
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 171,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/StaffProfile.tsx",
                                                    lineNumber: 170,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-6 py-4 text-right",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: `/admin/staff/${staff.id}`,
                                                            className: "shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-100 transition",
                                                            children: "View Profile"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/StaffProfile.tsx",
                                                            lineNumber: 176,
                                                            columnNumber: 23
                                                        }, this),
                                                        canManageRoles && staff.isApproved && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "ml-3 inline-block",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$AccountRoleButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                userId: staff.id,
                                                                name: staff.name || staff.email || 'this user',
                                                                role: "ADMIN",
                                                                onMoved: ()=>{
                                                                    setStaffList((current)=>current.filter((person)=>person.id !== staff.id));
                                                                    setMessage('Account moved to Admin Users.');
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 184,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/StaffProfile.tsx",
                                                            lineNumber: 183,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/StaffProfile.tsx",
                                                    lineNumber: 175,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/StaffProfile.tsx",
                                            lineNumber: 152,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, staff.id, true, {
                                    fileName: "[project]/components/StaffProfile.tsx",
                                    lineNumber: 142,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/StaffProfile.tsx",
                            lineNumber: 140,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/StaffProfile.tsx",
                    lineNumber: 130,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/StaffProfile.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/StaffProfile.tsx",
        lineNumber: 91,
        columnNumber: 5
    }, this);
}
_s(StaffListPage, "wH1MJRVOm3QNvAVuzSJXggmuUZM=");
_c = StaffListPage;
var _c;
__turbopack_context__.k.register(_c, "StaffListPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/leave.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ANNUAL_NOTICE_DAYS",
    ()=>ANNUAL_NOTICE_DAYS,
    "LEAVE_LABELS",
    ()=>LEAVE_LABELS,
    "LEAVE_STATUS_LABELS",
    ()=>LEAVE_STATUS_LABELS,
    "annualNoticeError",
    ()=>annualNoticeError,
    "leaveDate",
    ()=>leaveDate,
    "leavePeriod",
    ()=>leavePeriod,
    "perthToday",
    ()=>perthToday
]);
const ANNUAL_NOTICE_DAYS = 7;
function leaveDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Choose valid leave dates.');
    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('Choose valid leave dates.');
    return date;
}
function leavePeriod(startDate, endDate) {
    const start = leaveDate(startDate);
    const end = leaveDate(endDate);
    const days = (end.getTime() - start.getTime()) / 86400000 + 1;
    if (days < 1 || days > 31) throw new Error('Choose a leave period of 1 to 31 calendar days, with the end on or after the start.');
    return Array.from({
        length: days
    }, (_, index)=>new Date(start.getTime() + index * 86400000));
}
function perthToday() {
    const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Australia/Perth',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
    return leaveDate(today);
}
function annualNoticeError(dates) {
    const earliest = Math.min(...dates.map((date)=>date.getTime()));
    const minimum = perthToday().getTime() + ANNUAL_NOTICE_DAYS * 86400000;
    return earliest < minimum ? `Annual leave needs at least ${ANNUAL_NOTICE_DAYS} days of notice.` : null;
}
const LEAVE_LABELS = {
    ANNUAL: 'Annual leave',
    PERSONAL: 'Personal leave',
    UNPAID: 'Unpaid leave'
};
const LEAVE_STATUS_LABELS = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Not approved',
    CANCEL_REQUESTED: 'Cancellation requested',
    CANCELLED: 'Cancelled'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_09uxdw2._.js.map