import { jsx as _jsx } from "react/jsx-runtime";
import { HerbCard } from '../components/HerbCard';
import { herbsData } from '../data/herbs';
export default function Database() {
    return (_jsx("div", { className: "database", children: herbsData.map((herb) => (_jsx(HerbCard, { herb: herb }, herb.id))) }));
}
