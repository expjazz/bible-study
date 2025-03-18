import { api, HydrateClient } from "@/trpc/server";
import Dockview from "./Dockview";

export default function Home() {
  return (
    <HydrateClient>
      <main className="relative max-h-[calc(100vh-10%)] w-full">
        <Dockview />
      </main>
    </HydrateClient>
  );
}
