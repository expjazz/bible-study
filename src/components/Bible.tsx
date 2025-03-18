import React from "react";
import { api } from "@/trpc/react";
const Bible = () => {
  const versions = api.bible.getVersions.useQuery();
  console.log(versions.data);
  return <div className="h-[400px] w-[400px] bg-blue-200"> o que é isso</div>;
};

export default Bible;
