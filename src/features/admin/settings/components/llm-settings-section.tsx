"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckIcon, FlaskConicalIcon, LoaderIcon } from "lucide-react";
import {
  useGetSetting,
  useUpdateSetting,
} from "@/features/admin/settings/hooks/use-settings";
import ModelPlaygroundSheet from "@/features/admin/settings/components/model-playground-sheet";

const PROVIDERS = ["openrouter"] as const;

const MODELS: Record<string, string[]> = {
  openrouter: [
    "openai/gpt-4o",
    "openai/gpt-4o-mini",
    "openai/gpt-4.1",
    "openai/gpt-4.1-mini",
    "openai/o4-mini",
    "google/gemini-2.5-flash",
    "anthropic/claude-sonnet-4-5",
  ],
};

const LlmSettingsSection = () => {
  const providerSetting = useGetSetting("llm_provider");
  const modelSetting = useGetSetting("llm_model");
  const updateSetting = useUpdateSetting();

  const [provider, setProvider] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [playgroundOpen, setPlaygroundOpen] = useState(false);

  const currentProvider = providerSetting?.value ?? "openrouter";
  const currentModel = modelSetting?.value ?? "google/gemini-2.5-flash";

  const activeProvider = provider || currentProvider;
  const activeModel = model || currentModel;

  const hasChanges =
    (provider !== "" && provider !== currentProvider) ||
    (model !== "" && model !== currentModel);

  const handleSave = async () => {
    if (!hasChanges || saving) return;
    setSaving(true);
    await Promise.all([
      updateSetting({ key: "llm_provider", value: activeProvider }),
      updateSetting({ key: "llm_model", value: activeModel }),
    ]);
    setSaving(false);
    setProvider("");
    setModel("");
  };

  return (
    <>
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium">Language Model</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Provider and model used for debates
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-5">
          {/* Active config */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono">{currentProvider}</span>
            <span className="opacity-40">/</span>
            <span className="font-mono">{currentModel}</span>
          </div>

          {/* Selects */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground tracking-wide uppercase">
                Provider
              </Label>
              <Select
                value={activeProvider}
                onValueChange={(v) => {
                  setProvider(v);
                  setModel(MODELS[v]?.[0] ?? "");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground tracking-wide uppercase">
                Model
              </Label>
              <Select value={activeModel} onValueChange={setModel}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(MODELS[activeProvider] ?? []).map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Actions */}
          <div className="flex gap-2.5">
            <Button
              className="flex-1 transition-opacity duration-200"
              size="sm"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              variant={hasChanges ? "default" : "ghost"}
            >
              {saving ? (
                <>
                  <LoaderIcon className="size-3 animate-spin mr-1.5" />
                  Saving…
                </>
              ) : hasChanges ? (
                "Save"
              ) : (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckIcon className="size-3" />
                  Saved
                </span>
              )}
            </Button>

            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              onClick={() => setPlaygroundOpen(true)}
              disabled={hasChanges}
            >
              <FlaskConicalIcon className="size-3.5 mr-1.5" />
              Try it
            </Button>
          </div>
        </div>
      </section>

      <ModelPlaygroundSheet
        open={playgroundOpen}
        onOpenChange={setPlaygroundOpen}
        provider={activeProvider}
        model={activeModel}
      />
    </>
  );
};

export default LlmSettingsSection;
