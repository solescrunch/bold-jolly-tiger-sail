import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DQzpVFbF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const frameRef = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const frame = frameRef.current;
		if (!frame) return;
		const focusRealm = () => frame.contentWindow?.focus();
		frame.addEventListener("load", () => {
			setReady(true);
			focusRealm();
		});
		const onPointer = () => focusRealm();
		window.addEventListener("pointerdown", onPointer);
		return () => window.removeEventListener("pointerdown", onPointer);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "realm-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `realm-veil${ready ? " is-ready" : ""}`,
			"aria-hidden": ready,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "realm-kicker",
					children: "Wayfarer / v2.2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Reedhaven" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "realm-sub",
					children: "Starlit Highlands · Celestial Observatory · Moonlight Cavern"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "realm-hint",
					children: "Click the world to walk. WASD moves. I opens your backpack."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
			ref: frameRef,
			className: "realm-frame",
			title: "Wayfarer realm",
			src: "/preview/realm.html",
			allow: "gamepad; fullscreen; autoplay"
		})]
	});
}
//#endregion
export { Home as component };
