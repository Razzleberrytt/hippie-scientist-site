import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function HerbCard({ herb }) {
    return (_jsxs("div", { className: "herb-card", children: [_jsx("h2", { className: "herb-card__name", children: herb.name }), _jsx("p", { className: "herb-card__description", children: herb.description })] }));
}
