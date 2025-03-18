import React from "react";
import { api } from "@/trpc/react";
const Bible = () => {
  const versions = api.bible.getVersions.useQuery();
  console.log(versions);
  return <div>Biblia</div>;
};

export default Bible;
