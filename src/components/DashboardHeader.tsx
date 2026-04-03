import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Columns2, LogOut, Settings2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const tabs = [
  { id: "all", label: "ALL", sublabel: "전체" },
  { id: "dom", label: "DOM", sublabel: "국내" },
  { id: "nas", label: "NAS", sublabel: "북미" },
  { id: "eu", label: "EU", sublabel: "유럽" },
];

export function DashboardHeader() {
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("로그아웃 되었습니다.");
    navigate("/auth", { replace: true });
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-base font-bold text-foreground">Logic Ledger</h1>
          <p className="text-xs text-muted-foreground">비교경로 표출 조건 관리</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md hover:bg-secondary text-muted-foreground transition-colors">
            <Columns2 size={18} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="로그아웃"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-center transition-colors relative ${
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="text-sm font-semibold">{tab.label}</div>
            <div className="text-[10px]">{tab.sublabel}</div>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
            )}
          </button>
        ))}
      </div>
    </header>
  );
}
