import { GenerateForm } from "@/components/generate/generate-form";
import { Badge } from "@/components/ui/badge";

export default function GeneratePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create</h1>
        <p className="text-muted-foreground">
          Generate AI videos and images with the best models
        </p>
      </div>

      <GenerateForm />

      {/* Quick Prompts */}
      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Try these prompts
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            "A golden retriever running on a beach at sunset, cinematic",
            "Cyberpunk cityscape with neon lights and flying cars",
            "A medieval castle on a cliff overlooking the ocean, fog",
            "Astronaut floating in space with earth in background",
            "Underwater coral reef with tropical fish, 4K",
            "Time-lapse of a flower blooming in a garden",
          ].map((prompt) => (
            <Badge
              key={prompt}
              variant="outline"
              className="cursor-pointer border-border/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-violet-500/50 hover:text-foreground"
            >
              {prompt.slice(0, 50)}...
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
