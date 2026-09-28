import { CarteKPI } from "../components/CarteKPI";
import { FluxTransactions } from "../components/FluxTransactions";
import { PanneauAgents } from "../components/PanneauAgents";
import { GraphiqueFraude } from "../components/GraphiqueFraude";

export function Operations() {
  return (
    <div className="flex flex-col h-full min-h-0 gap-2 p-2">
      {/* KPI row */}
      <CarteKPI />

      {/* Middle: transaction stream + agent panel */}
      <div className="flex gap-2 flex-1 min-h-0" style={{ minHeight: 0 }}>
        <div className="flex-1 min-w-0 min-h-0">
          <FluxTransactions />
        </div>
        <div className="w-72 shrink-0 min-h-0">
          <PanneauAgents />
        </div>
      </div>

      {/* Bottom: fraud chart */}
      <div className="h-52 shrink-0">
        <GraphiqueFraude />
      </div>
    </div>
  );
}
