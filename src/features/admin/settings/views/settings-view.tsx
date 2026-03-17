"use client";

import AgentsTable from "@/features/admin/settings/components/agent-table";
import TopicsTable from "@/features/admin/settings/components/topic-table";

const SettingsView = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage agents and debate topics</p>
      </div>
      <AgentsTable />
      <TopicsTable />
    </div>
  );
};

export default SettingsView;
