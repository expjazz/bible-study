import { api, HydrateClient } from "@/trpc/server";
import Dockview from "./Dockview";

export default function Home() {
  return (
    <HydrateClient>
      <main className="flex h-[800px] w-full flex-col bg-white text-black">
        <Dockview />
      </main>
    </HydrateClient>
  );
}
