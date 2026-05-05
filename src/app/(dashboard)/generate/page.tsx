import { GenerateForm } from "@/components/generate/generate-form";

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
    </div>
  );
}
