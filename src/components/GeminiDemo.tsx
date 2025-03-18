"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function GeminiDemo() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Use the tRPC mutation
  const generateText = api.gemini.generateText.useMutation({
    onSuccess: (data) => {
      setResponse(data.text);
      setIsLoading(false);
    },
    onError: (error) => {
      setResponse(`Error: ${error.message}`);
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() === "") return;

    setIsLoading(true);
    generateText.mutate({ prompt });
  };

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Gemini AI Demo</CardTitle>
        <CardDescription>
          Ask Gemini anything and get an AI-powered response.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <Button type="submit" disabled={isLoading || prompt.trim() === ""}>
            {isLoading ? "Generating..." : "Generate Response"}
          </Button>
        </form>

        {response && (
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-semibold">Response:</h3>
            <div className="bg-muted whitespace-pre-wrap rounded-md p-4">
              {response}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        Powered by Google&apos;s Gemini API
      </CardFooter>
    </Card>
  );
}
