import { FEATURES } from "../config/brand";

// Ubicación publicitaria preparada. Con publicidad apagada no renderiza ni carga scripts.
export default function AdSlot({ placement }) {
  if (!FEATURES.ads) return null;
  return <div data-ad-placement={placement} className="my-8 min-h-[90px]" />;
}
