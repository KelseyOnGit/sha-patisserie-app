(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
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
    const [breakStatusError, setBreakStatusError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [breakSeconds, setBreakSeconds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [statusMessage, setStatusMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [upcomingShift, setUpcomingShift] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const statusRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const actionInFlight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
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
    const loadBreakStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ClockInCard.useCallback[loadBreakStatus]": ()=>{
            if (actionInFlight.current) return;
            const requestId = ++statusRequest.current;
            return fetch('/api/shifts/breaks', {
                cache: 'no-store'
            }).then({
                "ClockInCard.useCallback[loadBreakStatus]": async (res)=>{
                    const data = await res.json();
                    if (requestId !== statusRequest.current) return;
                    if (!res.ok) throw new Error(data.error || 'Unable to load break status.');
                    setBreakShift(data.session || null);
                    setIsClockedIn(Boolean(data.session));
                    setBreakStatusError('');
                }
            }["ClockInCard.useCallback[loadBreakStatus]"]).catch({
                "ClockInCard.useCallback[loadBreakStatus]": (error)=>{
                    if (requestId !== statusRequest.current) return;
                    console.error('Failed to load break status:', error);
                    setBreakStatusError(error instanceof Error ? error.message : 'Unable to load break status.');
                }
            }["ClockInCard.useCallback[loadBreakStatus]"]);
        }
    }["ClockInCard.useCallback[loadBreakStatus]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClockInCard.useEffect": ()=>{
            void loadBreakStatus();
            const refresh = {
                "ClockInCard.useEffect.refresh": ()=>{
                    void loadBreakStatus();
                }
            }["ClockInCard.useEffect.refresh"];
            window.addEventListener('focus', refresh);
            const interval = setInterval(refresh, 30000);
            return ({
                "ClockInCard.useEffect": ()=>{
                    window.removeEventListener('focus', refresh);
                    clearInterval(interval);
                }
            })["ClockInCard.useEffect"];
        }
    }["ClockInCard.useEffect"], [
        loadBreakStatus
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClockInCard.useEffect": ()=>{
            if (!breakShift?.startBreak || breakShift.endBreak) {
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
            setStatusMessage('Clock in before recording a break.');
            return;
        }
        setLoading(true);
        actionInFlight.current = true;
        statusRequest.current++;
        const action = breakShift.startBreak && !breakShift.endBreak ? 'FINISH' : 'START';
        try {
            const res = await fetch('/api/shifts/breaks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: breakShift.id,
                    action
                })
            });
            const data = await res.json();
            if (!res.ok) {
                setStatusMessage(data.error || 'Unable to update break.');
            } else {
                setBreakShift(data.session);
                setStatusMessage(action === 'START' ? 'Break started successfully.' : 'Break finished successfully.');
            }
        } catch  {
            setStatusMessage('Unable to connect to the server.');
        } finally{
            actionInFlight.current = false;
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClockInCard.useEffect": ()=>{
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
        actionInFlight.current = true;
        statusRequest.current++;
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
                }
            } catch (err) {
                console.error('Clocking error:', err);
                alert('An error occurred while connecting to the server.');
            } finally{
                actionInFlight.current = false;
                await loadBreakStatus();
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
                            lineNumber: 229,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-1 flex items-center justify-center gap-2 font-mono text-xs tracking-wide",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                                }, void 0, false, {
                                    fileName: "[project]/components/ClockInCard.tsx",
                                    lineNumber: 231,
                                    columnNumber: 13
                                }, this),
                                time || '12:00:00 PM'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ClockInCard.tsx",
                            lineNumber: 230,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ClockInCard.tsx",
                    lineNumber: 228,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 227,
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
                        lineNumber: 239,
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
                                        lineNumber: 249,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "Zushi Bento",
                                        children: "📍 Zushi Bento"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ClockInCard.tsx",
                                        lineNumber: 250,
                                        columnNumber: 13
                                    }, this),
                                    ("TURBOPACK compile-time value", "true") === 'true' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "Test",
                                        children: "🧪 Office (Test)"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ClockInCard.tsx",
                                        lineNumber: 252,
                                        columnNumber: 3
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ClockInCard.tsx",
                                lineNumber: 243,
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
                                        lineNumber: 257,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/ClockInCard.tsx",
                                    lineNumber: 256,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/ClockInCard.tsx",
                                lineNumber: 255,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 242,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 238,
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
                                lineNumber: 266,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-bold text-stone-800",
                                children: userName
                            }, void 0, false, {
                                fileName: "[project]/components/ClockInCard.tsx",
                                lineNumber: 269,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 265,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-right",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${isClockedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`,
                            children: isClockedIn ? 'Clocked In' : 'Clocked Out'
                        }, void 0, false, {
                            fileName: "[project]/components/ClockInCard.tsx",
                            lineNumber: 272,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 271,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 264,
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
                                lineNumber: 283,
                                columnNumber: 11
                            }, this),
                            upcomingShift && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] font-semibold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full",
                                children: "Scheduled"
                            }, void 0, false, {
                                fileName: "[project]/components/ClockInCard.tsx",
                                lineNumber: 285,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 282,
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
                                lineNumber: 292,
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
                                lineNumber: 295,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 291,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-stone-500 italic",
                        children: "No upcoming shifts scheduled soon."
                    }, void 0, false, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 298,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 281,
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
                        lineNumber: 304,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>handleClockAction('out'),
                        disabled: loading || !isClockedIn || Boolean(breakShift?.startBreak && !breakShift.endBreak) || Boolean(breakStatusError),
                        className: "w-full py-3.5 rounded-2xl font-bold text-sm bg-rose-200 hover:bg-rose-300 text-rose-900 shadow-sm disabled:opacity-50 transition-all",
                        children: loading ? '...' : 'Clock Out'
                    }, void 0, false, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 312,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 303,
                columnNumber: 7
            }, this),
            isClockedIn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleBreakToggle,
                        disabled: loading || !breakShift || Boolean(breakShift.endBreak) || Boolean(breakStatusError),
                        className: "w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50",
                        children: breakShift?.endBreak ? 'Break Recorded' : breakShift?.startBreak ? 'End Break' : 'Start Break'
                    }, void 0, false, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 323,
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
                        lineNumber: 335,
                        columnNumber: 13
                    }, this),
                    !breakShift && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-2 text-xs text-amber-800",
                        children: "No active clock-in session. Refresh your status or clock in first."
                    }, void 0, false, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 340,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 322,
                columnNumber: 9
            }, this),
            breakStatusError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                className: "mt-3 text-center text-xs text-rose-700",
                children: [
                    breakStatusError,
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>void loadBreakStatus(),
                        className: "underline",
                        children: "Retry status"
                    }, void 0, false, {
                        fileName: "[project]/components/ClockInCard.tsx",
                        lineNumber: 346,
                        columnNumber: 28
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 345,
                columnNumber: 28
            }, this),
            statusMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "mt-3 text-center text-xs font-semibold text-stone-700",
                children: statusMessage
            }, void 0, false, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 349,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-center text-[11px] text-stone-400 mt-4",
                children: "Onsite location required"
            }, void 0, false, {
                fileName: "[project]/components/ClockInCard.tsx",
                lineNumber: 352,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ClockInCard.tsx",
        lineNumber: 225,
        columnNumber: 5
    }, this);
}
_s(ClockInCard, "ZHqol4XASRRYByeFxpodlQ2VRVU=");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$date$2d$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/date-format.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$leave$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/leave.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$date$2d$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDMY"])(value);
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
        lineNumber: 79,
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
            lineNumber: 144,
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
                    lineNumber: 149,
                    columnNumber: 36
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 149,
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
                        lineNumber: 153,
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
                        lineNumber: 154,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 152,
                columnNumber: 14
            }, this);
        }
        if (entry.status === 'CANCEL_REQUESTED') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-3 text-xs text-stone-500",
                children: "Waiting for your manager. This leave stays approved until they agree to cancel it."
            }, void 0, false, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 158,
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
                    lineNumber: 165,
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
                    lineNumber: 166,
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
                                        lineNumber: 168,
                                        columnNumber: 65
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusBadge, {
                                        status: entry.status
                                    }, void 0, false, {
                                        fileName: "[project]/components/LeavePanel.tsx",
                                        lineNumber: 168,
                                        columnNumber: 142
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/LeavePanel.tsx",
                                lineNumber: 168,
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
                                lineNumber: 169,
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
                                lineNumber: 170,
                                columnNumber: 9
                            }, this),
                            changeNote(entry),
                            entry.note && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-3 break-words text-sm text-stone-600",
                                children: entry.note
                            }, void 0, false, {
                                fileName: "[project]/components/LeavePanel.tsx",
                                lineNumber: 172,
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
                                lineNumber: 173,
                                columnNumber: 30
                            }, this),
                            staffActions(entry)
                        ]
                    }, entry.id, true, {
                        fileName: "[project]/components/LeavePanel.tsx",
                        lineNumber: 167,
                        columnNumber: 31
                    }, this))
            ]
        }, void 0, true, {
            fileName: "[project]/components/LeavePanel.tsx",
            lineNumber: 164,
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
                lineNumber: 182,
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
            lineNumber: 186,
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
                            lineNumber: 189,
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
                                    lineNumber: 191,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    disabled: busy,
                                    className: `${button} text-rose-700`,
                                    onClick: ()=>review(entry, 'REJECTED'),
                                    children: cancelling ? 'Keep leave' : 'Not approve'
                                }, void 0, false, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 192,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 190,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LeavePanel.tsx",
                    lineNumber: 188,
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
                            lineNumber: 196,
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
                            lineNumber: 197,
                            columnNumber: 41
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LeavePanel.tsx",
                    lineNumber: 195,
                    columnNumber: 19
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/LeavePanel.tsx",
            lineNumber: 187,
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
                        lineNumber: 206,
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
                        lineNumber: 207,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 205,
                columnNumber: 5
            }, this),
            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900",
                children: message
            }, void 0, false, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 209,
                columnNumber: 17
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                className: "rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 210,
                columnNumber: 15
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "py-5 text-sm text-stone-500",
                children: "Loading leave..."
            }, void 0, false, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 211,
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
                                        lineNumber: 213,
                                        columnNumber: 9
                                    }, this),
                                    Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$leave$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LEAVE_STATUS_LABELS"]).map(([value, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: value,
                                            children: label
                                        }, value, false, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 213,
                                            columnNumber: 108
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/LeavePanel.tsx",
                                lineNumber: 212,
                                columnNumber: 67
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/LeavePanel.tsx",
                        lineNumber: 212,
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
                                                    lineNumber: 217,
                                                    columnNumber: 153
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 217,
                                            columnNumber: 68
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/LeavePanel.tsx",
                                        lineNumber: 217,
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
                                                                lineNumber: 219,
                                                                columnNumber: 81
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/LeavePanel.tsx",
                                                        lineNumber: 219,
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
                                                                lineNumber: 220,
                                                                columnNumber: 59
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/LeavePanel.tsx",
                                                        lineNumber: 220,
                                                        columnNumber: 13
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "max-w-xs break-words p-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusBadge, {
                                                                status: entry.status
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/LeavePanel.tsx",
                                                                lineNumber: 221,
                                                                columnNumber: 54
                                                            }, this),
                                                            changeNote(entry),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "mt-2",
                                                                children: entry.note
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/LeavePanel.tsx",
                                                                lineNumber: 221,
                                                                columnNumber: 110
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                children: entry.reviewNote
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/LeavePanel.tsx",
                                                                lineNumber: 221,
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
                                                                lineNumber: 221,
                                                                columnNumber: 190
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/LeavePanel.tsx",
                                                        lineNumber: 221,
                                                        columnNumber: 13
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "p-3",
                                                        children: adminActions(entry)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/LeavePanel.tsx",
                                                        lineNumber: 222,
                                                        columnNumber: 13
                                                    }, this)
                                                ]
                                            }, entry.id, true, {
                                                fileName: "[project]/components/LeavePanel.tsx",
                                                lineNumber: 218,
                                                columnNumber: 42
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/LeavePanel.tsx",
                                        lineNumber: 218,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/LeavePanel.tsx",
                                lineNumber: 216,
                                columnNumber: 9
                            }, this),
                            !visible.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "py-6 text-sm text-stone-500",
                                children: "No leave requests for this status."
                            }, void 0, false, {
                                fileName: "[project]/components/LeavePanel.tsx",
                                lineNumber: 225,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/LeavePanel.tsx",
                        lineNumber: 215,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 211,
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
                                            lineNumber: 230,
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
                                            lineNumber: 230,
                                            columnNumber: 78
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 230,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-stone-500",
                                            children: "Personal leave balance"
                                        }, void 0, false, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 231,
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
                                            lineNumber: 231,
                                            columnNumber: 80
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 231,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 229,
                            columnNumber: 95
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "col-span-2 text-sm text-stone-500",
                            children: "Paid leave entitlement: None"
                        }, void 0, false, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 232,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/LeavePanel.tsx",
                        lineNumber: 228,
                        columnNumber: 20
                    }, this),
                    section('My requests', groups.filter((entry)=>entry.status === 'PENDING')),
                    section('Scheduled', groups.filter((entry)=>(entry.status === 'APPROVED' || entry.status === 'CANCEL_REQUESTED') && entry.endDate >= today)),
                    section('History', groups.filter((entry)=>entry.status === 'REJECTED' || entry.status === 'CANCELLED' || (entry.status === 'APPROVED' || entry.status === 'CANCEL_REQUESTED') && entry.endDate < today))
                ]
            }, void 0, true, {
                fileName: "[project]/components/LeavePanel.tsx",
                lineNumber: 227,
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
                lineNumber: 238,
                columnNumber: 16
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/LeavePanel.tsx",
        lineNumber: 204,
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
                            lineNumber: 298,
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
                            lineNumber: 298,
                            columnNumber: 182
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LeavePanel.tsx",
                    lineNumber: 298,
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
                            lineNumber: 300,
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
                                            lineNumber: 302,
                                            columnNumber: 11
                                        }, this),
                                        staff.filter((item)=>item.id !== currentUserId).map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: item.id,
                                                children: item.name || 'Unnamed staff'
                                            }, item.id, false, {
                                                fileName: "[project]/components/LeavePanel.tsx",
                                                lineNumber: 303,
                                                columnNumber: 76
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 301,
                                    columnNumber: 94
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 301,
                            columnNumber: 37
                        }, this),
                        entry && state.mode === 'edit' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium",
                            children: entry.user.name || 'Unnamed staff'
                        }, void 0, false, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 305,
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
                            lineNumber: 307,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-stone-500",
                            children: "No paid leave entitlement, so unpaid leave only."
                        }, void 0, false, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 308,
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
                                                    lineNumber: 310,
                                                    columnNumber: 26
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "PERSONAL",
                                                    children: "Personal leave"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/LeavePanel.tsx",
                                                    lineNumber: 310,
                                                    columnNumber: 70
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 310,
                                            columnNumber: 24
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "UNPAID",
                                            children: "Unpaid leave"
                                        }, void 0, false, {
                                            fileName: "[project]/components/LeavePanel.tsx",
                                            lineNumber: 310,
                                            columnNumber: 122
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 309,
                                    columnNumber: 64
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 309,
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
                                            lineNumber: 313,
                                            columnNumber: 68
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 313,
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
                                            lineNumber: 314,
                                            columnNumber: 66
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LeavePanel.tsx",
                                    lineNumber: 314,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 312,
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
                            lineNumber: 316,
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
                                    lineNumber: 317,
                                    columnNumber: 67
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 317,
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
                            lineNumber: 318,
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
                                    lineNumber: 319,
                                    columnNumber: 58
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 319,
                            columnNumber: 9
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            role: "alert",
                            className: "rounded-md bg-rose-50 p-3 text-sm text-rose-800",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/components/LeavePanel.tsx",
                            lineNumber: 320,
                            columnNumber: 19
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LeavePanel.tsx",
                    lineNumber: 299,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    disabled: busy,
                    className: "mt-5 w-full rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50",
                    children: busy ? 'Saving...' : text.send
                }, void 0, false, {
                    fileName: "[project]/components/LeavePanel.tsx",
                    lineNumber: 322,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/LeavePanel.tsx",
            lineNumber: 297,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/LeavePanel.tsx",
        lineNumber: 296,
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
    ()=>StaffProfileForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workingHours$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/workingHours.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
async function readApiResponse(response) {
    if (!response.headers.get('content-type')?.includes('application/json')) {
        throw new Error(`Unexpected server response (${response.status}). Check the API route.`);
    }
    return response.json();
}
function StaffProfileForm({ id }) {
    _s();
    // Navigation State
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('profile');
    // --- Profile Details State ---
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        fullName: '',
        email: '',
        contactNumber: '',
        accountStatus: 'Active',
        location: 'Sha Patisserie',
        employmentType: '',
        annualLeaveHours: '0',
        personalLeaveHours: '0',
        hourlyPayRate: '',
        rateLastUpdated: '',
        workingRightStatus: '',
        claimTaxFreeThreshold: null
    });
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isEditing, setIsEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [savedFormData, setSavedFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [canManageEmployment, setCanManageEmployment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newPin, setNewPin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [resettingPin, setResettingPin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // --- Regular Working Hours State ---
    const [workingHoursPolicy, setWorkingHoursPolicy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('custom');
    const [workingHours, setWorkingHours] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workingHours$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_WORKING_HOURS"]);
    const [savingHours, setSavingHours] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loadingHours, setLoadingHours] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Load Profile Details
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StaffProfileForm.useEffect": ()=>{
            async function loadProfile() {
                try {
                    const query = id ? `?userId=${encodeURIComponent(id)}` : '';
                    const response = await fetch(`/api/admin/staff/update${query}`);
                    const data = await readApiResponse(response);
                    if (!response.ok) throw new Error(data.error || 'Failed to load staff profile');
                    setCanManageEmployment(data.canManageEmployment);
                    const user = data.user;
                    const loadedFormData = {
                        fullName: user.name || '',
                        email: user.email,
                        contactNumber: user.contactNumber || '',
                        accountStatus: user.status === 'ACTIVE' ? 'Active' : user.status === 'PENDING' ? 'Pending' : 'Inactive (Left Company)',
                        location: user.location?.code === 'ZB' ? 'Zushi Bento' : 'Sha Patisserie',
                        employmentType: user.employmentType ?? '',
                        annualLeaveHours: String(user.annualLeaveHours),
                        personalLeaveHours: String(user.personalLeaveHours),
                        hourlyPayRate: user.hourlyPayRate,
                        rateLastUpdated: user.rateLastUpdated,
                        workingRightStatus: user.workingRightStatus,
                        claimTaxFreeThreshold: user.claimTaxFreeThreshold
                    };
                    setFormData(loadedFormData);
                    setSavedFormData(loadedFormData);
                } catch (error) {
                    setMessage(error instanceof Error ? error.message : 'Failed to load staff profile.');
                } finally{
                    setLoading(false);
                }
            }
            void loadProfile();
        }
    }["StaffProfileForm.useEffect"], [
        id
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StaffProfileForm.useEffect": ()=>{
            async function loadWorkingHours() {
                try {
                    const query = id ? `?userId=${encodeURIComponent(id)}` : '';
                    const response = await fetch(`/api/admin/staff/working-hours${query}`);
                    const data = await readApiResponse(response);
                    if (!response.ok) throw new Error(data.error || 'Failed to load regular working hours');
                    setWorkingHoursPolicy(data.workingHoursPolicy);
                    if (data.workingHours) {
                        const schedule = Object.fromEntries(Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workingHours$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_WORKING_HOURS"]).map({
                            "StaffProfileForm.useEffect.loadWorkingHours.schedule": (day)=>{
                                const savedDay = data.workingHours?.[day];
                                return [
                                    day,
                                    {
                                        ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workingHours$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_WORKING_HOURS"][day],
                                        ...savedDay,
                                        additionalHours: Array.isArray(savedDay?.additionalHours) ? savedDay.additionalHours : [],
                                        breakMinutes: savedDay && Number.isInteger(savedDay.breakMinutes) ? savedDay.breakMinutes : savedDay?.enabled ? 30 : 0
                                    }
                                ];
                            }
                        }["StaffProfileForm.useEffect.loadWorkingHours.schedule"]));
                        setWorkingHours(schedule);
                    }
                } catch (error) {
                    setMessage(error instanceof Error ? error.message : 'Failed to load regular working hours.');
                } finally{
                    setLoadingHours(false);
                }
            }
            void loadWorkingHours();
        }
    }["StaffProfileForm.useEffect"], [
        id
    ]);
    const isTaxFreeEligible = formData.workingRightStatus === 'Aus Citizen / Permanent Resident' || formData.workingRightStatus === 'Student Visa';
    // --- Profile Form Handlers ---
    const handleChange = (e)=>{
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target;
            setFormData((prev)=>({
                    ...prev,
                    [name]: checked
                }));
        } else {
            setFormData((prev)=>({
                    ...prev,
                    [name]: value
                }));
        }
    };
    const handleStatusChange = (status)=>{
        setFormData((prev)=>({
                ...prev,
                workingRightStatus: status,
                claimTaxFreeThreshold: status === 'Working Holiday' ? false : status === '' ? null : prev.claimTaxFreeThreshold
            }));
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin/staff/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    userId: id
                })
            });
            const data = await readApiResponse(res);
            if (!res.ok) throw new Error(data.error || 'Failed to update staff profile');
            setSavedFormData(formData);
            setIsEditing(false);
            setMessage('Staff profile saved successfully.');
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'An error occurred.');
        } finally{
            setSaving(false);
        }
    };
    const handleCancel = ()=>{
        if (savedFormData) setFormData(savedFormData);
        setIsEditing(false);
        setMessage('');
    };
    const handleOffboard = async ()=>{
        const confirmEnd = window.confirm(`End the profile for ${formData.fullName || 'this staff member'}? Save changes to deactivate access and remove them from current/future rosters. Past shifts and payroll history will be retained.`);
        if (confirmEnd) {
            setFormData((prev)=>({
                    ...prev,
                    accountStatus: 'Inactive (Left Company)'
                }));
            setMessage('Profile marked as Inactive. Don\'t forget to save changes.');
        }
    };
    //--- Reset PIN Handler ---
    const handleResetPin = async ()=>{
        if (!id) return;
        if (!/^\d{4}$/.test(newPin)) {
            setMessage('PIN must be 4 digits.');
            return;
        }
        const confirmReset = window.confirm(`Reset the PIN for ${formData.fullName || 'this staff member'}? Their old PIN will stop working.`);
        if (!confirmReset) return;
        setResettingPin(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin/users/reset-pin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: id,
                    newPin
                })
            });
            const data = await readApiResponse(res);
            if (!res.ok) throw new Error(data.error || 'Failed to reset PIN');
            setNewPin('');
            setMessage('PIN reset successfully.');
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Failed to reset PIN.');
        } finally{
            setResettingPin(false);
        }
    };
    // --- Working Hours Handlers ---
    const handleDayToggle = (day)=>{
        setWorkingHours((prev)=>({
                ...prev,
                [day]: {
                    ...prev[day],
                    enabled: !prev[day].enabled
                }
            }));
    };
    const handleHoursFieldChange = (day, field, value)=>{
        setWorkingHours((prev)=>({
                ...prev,
                [day]: {
                    ...prev[day],
                    [field]: value
                }
            }));
    };
    const handleAddHours = (day)=>{
        setWorkingHours((prev)=>({
                ...prev,
                [day]: {
                    ...prev[day],
                    additionalHours: [
                        ...prev[day].additionalHours,
                        {
                            startTime: '',
                            endTime: ''
                        }
                    ]
                }
            }));
    };
    const handleAdditionalHoursChange = (day, index, field, value)=>{
        setWorkingHours((prev)=>({
                ...prev,
                [day]: {
                    ...prev[day],
                    additionalHours: prev[day].additionalHours.map((range, rangeIndex)=>rangeIndex === index ? {
                            ...range,
                            [field]: value
                        } : range)
                }
            }));
    };
    const handleRemoveAdditionalHours = (day, index)=>{
        setWorkingHours((prev)=>({
                ...prev,
                [day]: {
                    ...prev[day],
                    additionalHours: prev[day].additionalHours.filter((_, rangeIndex)=>rangeIndex !== index)
                }
            }));
    };
    const handleBreakMinutesChange = (day, value)=>{
        const breakMinutes = value === '' ? 0 : Number(value);
        if (!Number.isInteger(breakMinutes) || breakMinutes < 0 || breakMinutes > 240) return;
        setWorkingHours((prev)=>({
                ...prev,
                [day]: {
                    ...prev[day],
                    breakMinutes
                }
            }));
    };
    const handleSaveWorkingHours = async ()=>{
        setSavingHours(true);
        setMessage('');
        try {
            const res = await fetch(`/api/admin/staff/working-hours`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: id,
                    workingHoursPolicy,
                    workingHours
                })
            });
            const data = await readApiResponse(res);
            if (!res.ok) throw new Error(data.error || 'Failed to save working hours');
            setMessage('Regular working hours saved successfully.');
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Failed to save working hours.');
        } finally{
            setSavingHours(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mx-auto max-w-4xl space-y-6 p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-stone-200 pb-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-end justify-between gap-4 pb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-bold uppercase tracking-widest text-stone-500",
                                        children: "Admin Panel"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 380,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "mt-1 text-2xl font-bold text-stone-900",
                                        children: formData.fullName ? `${formData.fullName}'s Profile` : 'Staff Profile'
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 383,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 379,
                                columnNumber: 11
                            }, this),
                            activeTab === 'profile' && !isEditing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setIsEditing(true),
                                disabled: loading,
                                className: "rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50",
                                children: "Edit Profile"
                            }, void 0, false, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 388,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/StaffProfile.tsx",
                        lineNumber: 378,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-6 text-sm font-semibold text-stone-500",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setActiveTab('profile');
                                    setMessage('');
                                },
                                className: `pb-3 border-b-2 transition ${activeTab === 'profile' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-700'}`,
                                children: "Profile Details"
                            }, void 0, false, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 401,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setActiveTab('working-hours');
                                    setMessage('');
                                },
                                className: `pb-3 border-b-2 transition ${activeTab === 'working-hours' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-700'}`,
                                children: "Regular Working Hours"
                            }, void 0, false, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 415,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/StaffProfile.tsx",
                        lineNumber: 400,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/StaffProfile.tsx",
                lineNumber: 377,
                columnNumber: 7
            }, this),
            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `rounded-lg p-4 text-sm font-medium ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`,
                children: message
            }, void 0, false, {
                fileName: "[project]/components/StaffProfile.tsx",
                lineNumber: 433,
                columnNumber: 9
            }, this),
            activeTab === 'profile' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "space-y-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("fieldset", {
                        disabled: !isEditing || loading || saving,
                        className: "space-y-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-semibold text-stone-900 border-b border-stone-100 pb-3",
                                        children: "1. Personal & Account Details"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 450,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-xs font-bold uppercase text-stone-600 mb-1",
                                                        children: "Full Name"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 456,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        name: "fullName",
                                                        required: true,
                                                        value: formData.fullName,
                                                        onChange: handleChange,
                                                        placeholder: "e.g. Julia Wilson",
                                                        className: "w-full rounded-lg border border-stone-300 p-2.5 text-sm focus:border-stone-800 focus:outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 459,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 455,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-xs font-bold uppercase text-stone-600 mb-1",
                                                        children: "Email Address"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 471,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "email",
                                                        name: "email",
                                                        required: true,
                                                        value: formData.email,
                                                        onChange: handleChange,
                                                        placeholder: "julia@example.com",
                                                        className: "w-full rounded-lg border border-stone-300 p-2.5 text-sm focus:border-stone-800 focus:outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 474,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 470,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-xs font-bold uppercase text-stone-600 mb-1",
                                                        children: "Contact Number"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 486,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "tel",
                                                        name: "contactNumber",
                                                        value: formData.contactNumber,
                                                        onChange: handleChange,
                                                        placeholder: "0412 345 678",
                                                        className: "w-full rounded-lg border border-stone-300 p-2.5 text-sm focus:border-stone-800 focus:outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 489,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 485,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-xs font-bold uppercase text-stone-600 mb-1",
                                                        children: "Account Status"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 500,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        name: "accountStatus",
                                                        value: formData.accountStatus,
                                                        onChange: handleChange,
                                                        className: "w-full rounded-lg border border-stone-300 p-2.5 text-sm bg-white focus:border-stone-800 focus:outline-none",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "Active",
                                                                children: "Active"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 509,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "Pending",
                                                                children: "Pending"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 510,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: "Inactive (Left Company)",
                                                                children: "Inactive (Left Company)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 511,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 503,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 499,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 454,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 449,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-semibold text-stone-900 border-b border-stone-100 pb-3",
                                        children: "2. Venue & Work Settings"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 521,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-xs font-bold uppercase text-stone-600 mb-1",
                                                    children: "Location"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/StaffProfile.tsx",
                                                    lineNumber: 527,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    name: "location",
                                                    value: formData.location,
                                                    onChange: handleChange,
                                                    className: "w-full rounded-lg border border-stone-300 p-2.5 text-sm bg-white focus:border-stone-800 focus:outline-none",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Sha Patisserie",
                                                            children: "Sha Patisserie"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/StaffProfile.tsx",
                                                            lineNumber: 536,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Zushi Bento",
                                                            children: "Zushi Bento"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/StaffProfile.tsx",
                                                            lineNumber: 537,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/StaffProfile.tsx",
                                                    lineNumber: 530,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/StaffProfile.tsx",
                                            lineNumber: 526,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 525,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 520,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "space-y-4 border-t border-stone-200 pt-5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-semibold text-stone-900",
                                        children: "Employment & Leave Entitlement"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 545,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "block text-sm font-medium text-stone-700",
                                        children: [
                                            "Employment Status",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                name: "employmentType",
                                                value: formData.employmentType,
                                                onChange: handleChange,
                                                disabled: !canManageEmployment,
                                                className: "mt-1 block w-full rounded-lg border border-stone-300 bg-white p-2.5 text-sm disabled:bg-stone-50",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "",
                                                        children: "Not set"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 549,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "PART_TIME",
                                                        children: "Part Time"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 550,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "FULL_TIME",
                                                        children: "Full Time"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 551,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "CASUAL",
                                                        children: "Casual"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 552,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 548,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 546,
                                        columnNumber: 15
                                    }, this),
                                    formData.employmentType === 'PART_TIME' || formData.employmentType === 'FULL_TIME' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid gap-4 sm:grid-cols-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-sm text-stone-700",
                                                children: [
                                                    "Annual leave balance (hours)",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        name: "annualLeaveHours",
                                                        type: "number",
                                                        min: "0",
                                                        max: "99999999",
                                                        step: "0.01",
                                                        value: formData.annualLeaveHours,
                                                        onChange: handleChange,
                                                        disabled: !canManageEmployment,
                                                        className: "mt-1 block w-full rounded-lg border border-stone-300 p-2.5 text-sm"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 558,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 557,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-sm text-stone-700",
                                                children: [
                                                    "Personal leave balance (hours)",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        name: "personalLeaveHours",
                                                        type: "number",
                                                        min: "0",
                                                        max: "99999999",
                                                        step: "0.01",
                                                        value: formData.personalLeaveHours,
                                                        onChange: handleChange,
                                                        disabled: !canManageEmployment,
                                                        className: "mt-1 block w-full rounded-lg border border-stone-300 p-2.5 text-sm"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 561,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 560,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 556,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-stone-500",
                                        children: [
                                            "Leave entitlement: ",
                                            formData.employmentType === 'CASUAL' ? 'None (unpaid time off only)' : 'Employment status not set'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 564,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 544,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-semibold text-stone-900 border-b border-stone-100 pb-3",
                                        children: "3. Pay Rates & Tax Setup"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 567,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-xs font-bold uppercase text-stone-600 mb-1",
                                                        children: "Hourly Pay Rate ($/hr)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 573,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "relative",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "absolute left-3 top-2.5 text-stone-500",
                                                                children: "$"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 577,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "number",
                                                                step: "0.01",
                                                                name: "hourlyPayRate",
                                                                value: formData.hourlyPayRate,
                                                                onChange: handleChange,
                                                                className: "w-full rounded-lg border border-stone-300 py-2.5 pl-7 pr-3 text-sm focus:border-stone-800 focus:outline-none"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 578,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 576,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 572,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "block text-xs font-bold uppercase text-stone-600 mb-1",
                                                        children: "Rate Last Updated"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 590,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "date",
                                                        name: "rateLastUpdated",
                                                        value: formData.rateLastUpdated,
                                                        onChange: handleChange,
                                                        className: "w-full rounded-lg border border-stone-300 p-2.5 text-sm focus:border-stone-800 focus:outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 593,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 589,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 571,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-xs font-bold uppercase text-stone-600 mb-2",
                                                children: "Working Right Status"
                                            }, void 0, false, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 604,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    {
                                                        id: '',
                                                        label: 'Not set'
                                                    },
                                                    {
                                                        id: 'Aus Citizen / Permanent Resident',
                                                        label: 'Aus Citizen / Permanent Resident'
                                                    },
                                                    {
                                                        id: 'Student Visa',
                                                        label: 'Student Visa (Follows Citizen/PR Tax Table)'
                                                    },
                                                    {
                                                        id: 'Working Holiday',
                                                        label: 'Working Holiday (Follows Working Holiday Tax Table - NAT75331)'
                                                    }
                                                ].map((status)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "flex items-start gap-3 rounded-lg border border-stone-200 p-3 hover:bg-stone-50 cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "radio",
                                                                name: "workingRightStatus",
                                                                checked: formData.workingRightStatus === status.id,
                                                                onChange: ()=>handleStatusChange(status.id),
                                                                className: "mt-0.5 text-stone-900 focus:ring-stone-800"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 628,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-medium text-stone-800",
                                                                children: status.label
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 639,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, status.id, true, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 624,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 607,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 603,
                                        columnNumber: 15
                                    }, this),
                                    isTaxFreeEligible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-xl bg-stone-50 p-4 border border-stone-200 space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-xs font-bold uppercase text-stone-600",
                                                children: "Tax-Free Threshold (Citizen / PR / Student only)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 650,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-6 pt-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "inline-flex items-center gap-2 text-sm text-stone-800 cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "radio",
                                                                name: "taxFreeChoice",
                                                                checked: formData.claimTaxFreeThreshold === true,
                                                                onChange: ()=>setFormData((prev)=>({
                                                                            ...prev,
                                                                            claimTaxFreeThreshold: true
                                                                        })),
                                                                className: "text-stone-900 focus:ring-stone-800"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 655,
                                                                columnNumber: 23
                                                            }, this),
                                                            "Claiming Tax-Free Threshold"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 654,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "inline-flex items-center gap-2 text-sm text-stone-800 cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "radio",
                                                                name: "taxFreeChoice",
                                                                checked: formData.claimTaxFreeThreshold === null,
                                                                onChange: ()=>setFormData((prev)=>({
                                                                            ...prev,
                                                                            claimTaxFreeThreshold: null
                                                                        })),
                                                                className: "text-stone-900 focus:ring-stone-800"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 671,
                                                                columnNumber: 23
                                                            }, this),
                                                            "Not set"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 670,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "inline-flex items-center gap-2 text-sm text-stone-800 cursor-pointer",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "radio",
                                                                name: "taxFreeChoice",
                                                                checked: formData.claimTaxFreeThreshold === false,
                                                                onChange: ()=>setFormData((prev)=>({
                                                                            ...prev,
                                                                            claimTaxFreeThreshold: false
                                                                        })),
                                                                className: "text-stone-900 focus:ring-stone-800"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 683,
                                                                columnNumber: 23
                                                            }, this),
                                                            "No Tax-Free Threshold"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 682,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 653,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 649,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 566,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "rounded-2xl border border-rose-200 bg-rose-50/40 p-6 shadow-xs flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-base font-semibold text-rose-900",
                                                children: "4. Offboarding"
                                            }, void 0, false, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 705,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-rose-700 mt-0.5",
                                                children: "Deactivate staff access and mark account status as Inactive."
                                            }, void 0, false, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 706,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 704,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleOffboard,
                                        className: "rounded-lg border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-100 transition",
                                        children: "End Profile"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 710,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 703,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/StaffProfile.tsx",
                        lineNumber: 447,
                        columnNumber: 11
                    }, this),
                    isEditing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-end gap-3 pt-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleCancel,
                                disabled: saving,
                                className: "rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50",
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 723,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                disabled: saving || loading,
                                className: "rounded-lg bg-stone-900 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-stone-800 transition disabled:opacity-50",
                                children: saving ? 'Saving...' : 'Save Profile'
                            }, void 0, false, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 731,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/StaffProfile.tsx",
                        lineNumber: 722,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/StaffProfile.tsx",
                lineNumber: 446,
                columnNumber: 9
            }, this),
            activeTab === 'profile' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: handleSubmit,
                        className: "space-y-8"
                    }, void 0, false, {
                        fileName: "[project]/components/StaffProfile.tsx",
                        lineNumber: 746,
                        columnNumber: 5
                    }, this),
                    canManageEmployment && id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-semibold text-stone-900",
                                        children: "Reset PIN"
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 753,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-stone-500 mt-0.5",
                                        children: "Set a new login PIN for this staff member. Their current PIN will stop working immediately."
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 754,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 752,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-end gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                htmlFor: "newPin",
                                                className: "block text-xs font-bold uppercase text-stone-600 mb-1",
                                                children: "New PIN"
                                            }, void 0, false, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 760,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                id: "newPin",
                                                type: "password",
                                                inputMode: "numeric",
                                                autoComplete: "new-password",
                                                maxLength: 8,
                                                value: newPin,
                                                onChange: (e)=>setNewPin(e.target.value.replace(/\D/g, '')),
                                                placeholder: "4 digits",
                                                className: "w-40 rounded-lg border border-stone-300 p-2.5 text-sm focus:border-stone-800 focus:outline-none"
                                            }, void 0, false, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 763,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 759,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: handleResetPin,
                                        disabled: resettingPin || newPin.length !== 4,
                                        className: "rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition disabled:opacity-50",
                                        children: resettingPin ? 'Resetting...' : 'Reset PIN'
                                    }, void 0, false, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 775,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 758,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/StaffProfile.tsx",
                        lineNumber: 751,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/StaffProfile.tsx",
                lineNumber: 745,
                columnNumber: 3
            }, this),
            activeTab === 'working-hours' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-6 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-bold text-stone-900",
                                children: [
                                    "Set ",
                                    formData.fullName ? `${formData.fullName.split(' ')[0]}'s` : 'staff',
                                    " regular working hours"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 793,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-stone-500 mt-1",
                                children: "Regular working hours define when users are expected to work."
                            }, void 0, false, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 796,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/StaffProfile.tsx",
                        lineNumber: 792,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border border-stone-200 rounded-xl overflow-hidden",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "w-full text-left text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    className: "bg-stone-50 text-xs font-bold text-stone-500 border-b border-stone-200",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "py-3 px-4 font-semibold",
                                                children: "Working day"
                                            }, void 0, false, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 808,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "py-3 px-4 font-semibold",
                                                children: "Working hours (Optional)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 809,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "py-3 px-4 font-semibold",
                                                children: "Break (min)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 810,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "py-3 px-4 font-semibold",
                                                children: "Standard total hours (Optional)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/StaffProfile.tsx",
                                                lineNumber: 811,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/StaffProfile.tsx",
                                        lineNumber: 807,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/StaffProfile.tsx",
                                    lineNumber: 806,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    className: "divide-y divide-stone-100",
                                    children: Object.keys(workingHours).map((day)=>{
                                        const config = workingHours[day];
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: !config.enabled ? 'bg-stone-50/40 text-stone-400' : '',
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-3.5 px-4 font-medium",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "flex items-center gap-2.5 cursor-pointer text-stone-800",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "checkbox",
                                                                checked: config.enabled,
                                                                onChange: ()=>handleDayToggle(day),
                                                                className: "rounded border-stone-300 text-sky-600 focus:ring-sky-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 824,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: !config.enabled ? 'text-stone-400' : 'text-stone-800',
                                                                children: day
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 830,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 823,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/StaffProfile.tsx",
                                                    lineNumber: 822,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-3.5 px-4",
                                                    children: config.enabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-wrap items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "time",
                                                                        "aria-label": `${day} start time`,
                                                                        value: config.startTime,
                                                                        onChange: (e)=>handleHoursFieldChange(day, 'startTime', e.target.value),
                                                                        className: "w-28 rounded-md border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-stone-800 focus:outline-none"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                                        lineNumber: 839,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-xs text-stone-400",
                                                                        children: "to"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                                        lineNumber: 848,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "time",
                                                                        "aria-label": `${day} end time`,
                                                                        value: config.endTime,
                                                                        onChange: (e)=>handleHoursFieldChange(day, 'endTime', e.target.value),
                                                                        className: "w-28 rounded-md border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-stone-800 focus:outline-none"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                                        lineNumber: 849,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 838,
                                                                columnNumber: 29
                                                            }, this),
                                                            config.additionalHours.map((range, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex flex-wrap items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "time",
                                                                            "aria-label": `${day} additional period ${index + 1} start time`,
                                                                            value: range.startTime,
                                                                            onChange: (e)=>handleAdditionalHoursChange(day, index, 'startTime', e.target.value),
                                                                            className: "w-28 rounded-md border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-stone-800 focus:outline-none"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/StaffProfile.tsx",
                                                                            lineNumber: 861,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-xs text-stone-400",
                                                                            children: "to"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/StaffProfile.tsx",
                                                                            lineNumber: 870,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "time",
                                                                            "aria-label": `${day} additional period ${index + 1} end time`,
                                                                            value: range.endTime,
                                                                            onChange: (e)=>handleAdditionalHoursChange(day, index, 'endTime', e.target.value),
                                                                            className: "w-28 rounded-md border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-stone-800 focus:outline-none"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/StaffProfile.tsx",
                                                                            lineNumber: 871,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            "aria-label": `Remove ${day} additional period ${index + 1}`,
                                                                            onClick: ()=>handleRemoveAdditionalHours(day, index),
                                                                            className: "text-xs font-medium text-rose-700 hover:text-rose-800",
                                                                            children: "Remove"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/StaffProfile.tsx",
                                                                            lineNumber: 880,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, `${day}-hours-${index}`, true, {
                                                                    fileName: "[project]/components/StaffProfile.tsx",
                                                                    lineNumber: 860,
                                                                    columnNumber: 31
                                                                }, this)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>handleAddHours(day),
                                                                disabled: config.additionalHours.length >= 5,
                                                                className: "text-sky-600 hover:text-sky-700 text-xs font-semibold ml-2",
                                                                children: "+ Add hours"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 890,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 837,
                                                        columnNumber: 27
                                                    }, this) : null
                                                }, void 0, false, {
                                                    fileName: "[project]/components/StaffProfile.tsx",
                                                    lineNumber: 835,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-3.5 px-4",
                                                    children: config.enabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "number",
                                                                min: "0",
                                                                max: "240",
                                                                step: "5",
                                                                "aria-label": `${day} break duration in minutes`,
                                                                value: config.breakMinutes,
                                                                onChange: (e)=>handleBreakMinutesChange(day, e.target.value),
                                                                className: "w-20 rounded-md border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-stone-800 focus:outline-none"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 904,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-stone-500",
                                                                children: "min"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/StaffProfile.tsx",
                                                                lineNumber: 914,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 903,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/StaffProfile.tsx",
                                                    lineNumber: 901,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "py-3.5 px-4",
                                                    children: config.enabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        placeholder: "Type here",
                                                        value: config.standardHours,
                                                        onChange: (e)=>handleHoursFieldChange(day, 'standardHours', e.target.value),
                                                        className: "w-36 rounded-md border border-stone-300 px-3 py-1.5 text-xs text-stone-800 focus:border-stone-800 focus:outline-none"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/StaffProfile.tsx",
                                                        lineNumber: 920,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/StaffProfile.tsx",
                                                    lineNumber: 918,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, day, true, {
                                            fileName: "[project]/components/StaffProfile.tsx",
                                            lineNumber: 818,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/components/StaffProfile.tsx",
                                    lineNumber: 814,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/StaffProfile.tsx",
                            lineNumber: 805,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/StaffProfile.tsx",
                        lineNumber: 804,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-end gap-3 pt-4 border-t border-stone-100",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setActiveTab('profile'),
                                className: "rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100",
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 939,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleSaveWorkingHours,
                                disabled: savingHours || loadingHours,
                                className: "rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-sky-700 transition disabled:opacity-50",
                                children: loadingHours ? 'Loading...' : savingHours ? 'Saving...' : 'Save'
                            }, void 0, false, {
                                fileName: "[project]/components/StaffProfile.tsx",
                                lineNumber: 946,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/StaffProfile.tsx",
                        lineNumber: 938,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/StaffProfile.tsx",
                lineNumber: 791,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/StaffProfile.tsx",
        lineNumber: 375,
        columnNumber: 5
    }, this);
}
_s(StaffProfileForm, "cORaIInHigI4zxcj+9VB/AU2+Ck=");
_c = StaffProfileForm;
var _c;
__turbopack_context__.k.register(_c, "StaffProfileForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/date-format.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Display dates as dd-mm-yyyy. Accepts a YYYY-MM-DD string (or ISO timestamp, read as written) or a Date.
__turbopack_context__.s([
    "formatDMY",
    ()=>formatDMY
]);
function formatDMY(value) {
    const iso = typeof value === 'string' ? value.slice(0, 10) : `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
    const [year, month, day] = iso.split('-');
    return `${day}-${month}-${year}`;
}
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
"[project]/lib/workingHours.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_WORKING_HOURS",
    ()=>DEFAULT_WORKING_HOURS,
    "WORKING_DAYS",
    ()=>WORKING_DAYS,
    "regularHoursFor",
    ()=>regularHoursFor
]);
const WORKING_DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];
const DEFAULT_WORKING_HOURS = {
    Monday: {
        enabled: true,
        startTime: '07:00',
        endTime: '15:00',
        additionalHours: [],
        standardHours: '',
        breakMinutes: 30
    },
    Tuesday: {
        enabled: true,
        startTime: '07:00',
        endTime: '15:00',
        additionalHours: [],
        standardHours: '',
        breakMinutes: 30
    },
    Wednesday: {
        enabled: true,
        startTime: '07:00',
        endTime: '15:00',
        additionalHours: [],
        standardHours: '',
        breakMinutes: 30
    },
    Thursday: {
        enabled: true,
        startTime: '07:00',
        endTime: '15:00',
        additionalHours: [],
        standardHours: '',
        breakMinutes: 30
    },
    Friday: {
        enabled: true,
        startTime: '07:00',
        endTime: '15:00',
        additionalHours: [],
        standardHours: '',
        breakMinutes: 30
    },
    Saturday: {
        enabled: false,
        startTime: '',
        endTime: '',
        additionalHours: [],
        standardHours: '',
        breakMinutes: 0
    },
    Sunday: {
        enabled: false,
        startTime: '',
        endTime: '',
        additionalHours: [],
        standardHours: '',
        breakMinutes: 0
    }
};
function regularHoursFor(schedule, weekday) {
    const day = schedule ? schedule[weekday] : DEFAULT_WORKING_HOURS[weekday];
    return day?.enabled && day.startTime && day.endTime ? day : null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0od-vy7._.js.map