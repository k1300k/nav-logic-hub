import { DashboardHeader } from "@/components/DashboardHeader";
import { RouteSchematic } from "@/components/RouteSchematic";
import { StatCards } from "@/components/StatCards";
import { ConditionList } from "@/components/ConditionList";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <RouteSchematic />
        <StatCards />
        <ConditionList />
      </main>
    </div>
  );
};

export default Index;
