"use client";
import "../../node_modules/dockview/dist/styles/dockview.css";

import React, { useState } from "react";
import {
  DockviewApi,
  DockviewGroupPanelApi,
  DockviewPanelApi,
  themeLight,
  DockviewReact,
  DockviewReadyEvent,
  IDockviewPanelProps,
} from "dockview";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import Bible from "@/components/Bible";
const Dockview = () => {
  const [loading, setLoading] = useState(true);
  const dockviewRef = useRef<DockviewApi>();
  const bibleCountRef = useRef(1);
  const components: Record<
    string,
    React.FunctionComponent<IDockviewPanelProps>
  > = {
    bible: () => {
      return <Bible />;
    },
  };
  function onReady(event: DockviewReadyEvent) {
    const { api } = event;
    api.addPanel({
      id: `bible_${bibleCountRef.current}`,
      component: "bible",
      title: `Biblia ${bibleCountRef.current}`,
    });
    dockviewRef.current = api;
    setLoading(false);
  }

  return (
    <div className="relative h-[calc(100vh-10%)] w-full">
      <DockviewReact
        theme={themeLight}
        components={components}
        onReady={onReady}
      />
      <Button
        className="ml-4"
        onClick={() => {
          bibleCountRef.current += 1;
          dockviewRef.current?.addPanel({
            id: `bible_${bibleCountRef.current}`,
            component: "bible",
            title: `Biblia ${bibleCountRef.current}`,
          });
        }}
      >
        Abrir Bíblia
      </Button>
    </div>
  );
};

export default Dockview;
