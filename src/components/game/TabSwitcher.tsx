"use client";

import React, { useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  emoji?: string;
  icon?: React.ReactNode;
}

export interface TabSwitcherProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function TabSwitcher({
  tabs,
  activeTab,
  onTabChange,
  className,
}: TabSwitcherProps) {
  const handleValueChange = useCallback(
    (value: unknown) => {
      if (typeof value === "string") {
        onTabChange(value);
      }
    },
    [onTabChange]
  );

  return (
    <div className={cn("flex justify-center w-full", className)}>
      <Tabs
        value={activeTab}
        onValueChange={handleValueChange}
        className="w-full max-w-lg"
      >
        <TabsList
          className={cn(
            "h-auto p-1.5 rounded-2xl bg-muted/80 border-2 border-border shadow-sm w-full grid gap-1",
            tabs.length === 2 ? "grid-cols-2" : "grid-flow-col auto-cols-fr"
          )}
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="rounded-xl font-bold text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              {tab.emoji && <span className="text-base sm:text-lg">{tab.emoji}</span>}
              {tab.icon}
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
