import React from "react";
import { api } from "@/trpc/react";
const Bible = () => {
  const versions = api.bible.getVersions.useQuery();
  console.log(versions.data);
  return (
    <div className="flex h-screen items-center justify-center">
      {" "}
      o que é isso
    </div>
  );
};

export default Bible;
