import { api, HydrateClient } from "@/trpc/server";
import Dockview from "./Dockview";

export default function Home() {
  return (
    <HydrateClient>
      <main className="flex h-full w-full flex-col bg-white text-black">
        <div className="flex w-full flex-col">
          <Dockview />
        </div>
      </main>
    </HydrateClient>
  );
}
