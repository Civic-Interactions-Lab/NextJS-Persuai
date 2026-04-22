"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useGetTopics } from "@/features/admin/settings/hooks/use-topics";
import {
  useGetLlmPersonas,
  useCreateLlmPersona,
} from "@/features/llm-conversations/hooks/use-llm-personas";
import { useCreateLlmConversation } from "@/features/llm-conversations/hooks/use-llm-conversations";
import { TopicId, LlmPersonaId } from "../../../../convex/types/convexTypes";

const DEBATE_STYLES = [
  { value: "logical", label: "Logical" },
  { value: "emotional", label: "Emotional" },
  { value: "aggressive", label: "Aggressive" },
  { value: "cautious", label: "Cautious" },
  { value: "balanced", label: "Balanced" },
] as const;

const POLITICAL_LEANINGS = [
  { value: "far_left", label: "Far Left" },
  { value: "left", label: "Left" },
  { value: "center_left", label: "Centre-Left" },
  { value: "center", label: "Centre" },
  { value: "center_right", label: "Centre-Right" },
  { value: "right", label: "Right" },
  { value: "far_right", label: "Far Right" },
] as const;

interface NewDebateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DebateStyle =
  | "logical"
  | "emotional"
  | "aggressive"
  | "cautious"
  | "balanced";
type PoliticalLeaning =
  | "far_left"
  | "left"
  | "center_left"
  | "center"
  | "center_right"
  | "right"
  | "far_right";

const REUSE_NEW = "__new__";

const NewDebateSheet = ({ open, onOpenChange }: NewDebateSheetProps) => {
  const router = useRouter();
  const topics = useGetTopics();
  const existingPersonas = useGetLlmPersonas();
  const createPersona = useCreateLlmPersona();
  const createConversation = useCreateLlmConversation();

  // "reuse" mode — either REUSE_NEW or an existing persona _id
  const [personaMode, setPersonaMode] = useState<string>(REUSE_NEW);

  // Persona fields (used when creating new)
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [stance, setStance] = useState("");
  const [debateStyle, setDebateStyle] = useState<DebateStyle>("balanced");
  const [age, setAge] = useState("");
  const [occupation, setOccupation] = useState("");
  const [politicalLeaning, setPoliticalLeaning] = useState<
    PoliticalLeaning | ""
  >("");

  // Debate config
  const [topicId, setTopicId] = useState<string>("");
  const [maxRounds, setMaxRounds] = useState("10");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Deduplicate personas by name — keep only the most recently created one per name
  const uniquePersonas = existingPersonas
    ? Object.values(
        existingPersonas.reduce<Record<string, (typeof existingPersonas)[0]>>(
          (acc, p) => {
            if (!acc[p.name] || p._creationTime > acc[p.name]._creationTime) {
              acc[p.name] = p;
            }
            return acc;
          },
          {},
        ),
      )
    : [];

  const isNewPersona = personaMode === REUSE_NEW;
  const isValid =
    topicId &&
    (isNewPersona
      ? name.trim() && bio.trim() && stance.trim()
      : personaMode !== REUSE_NEW);

  // When user picks an existing persona, pre-fill the fields so they can review/edit
  const handlePersonaModeChange = (value: string) => {
    setPersonaMode(value);
    if (value !== REUSE_NEW) {
      const p = existingPersonas?.find((p) => p._id === value);
      if (p) {
        setName(p.name);
        setBio(p.bio);
        setStance(p.stance);
        setDebateStyle(p.debateStyle as DebateStyle);
        setAge(p.demographics.age ? String(p.demographics.age) : "");
        setOccupation(p.demographics.occupation ?? "");
        setPoliticalLeaning(
          (p.demographics.politicalLeaning as PoliticalLeaning) ?? "",
        );
      }
    } else {
      // reset fields for new persona
      setName("");
      setBio("");
      setStance("");
      setDebateStyle("balanced");
      setAge("");
      setOccupation("");
      setPoliticalLeaning("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError("");
    setIsSubmitting(true);

    try {
      let personaId: LlmPersonaId;

      if (!isNewPersona) {
        // Reuse existing — but save updated fields back as a new persona copy
        personaId = await createPersona({
          name: name.trim(),
          bio: bio.trim(),
          stance: stance.trim(),
          debateStyle,
          demographics: {
            age: age ? Number(age) : undefined,
            occupation: occupation.trim() || undefined,
            politicalLeaning: politicalLeaning || undefined,
          },
          isActive: true,
        });
      } else {
        personaId = await createPersona({
          name: name.trim(),
          bio: bio.trim(),
          stance: stance.trim(),
          debateStyle,
          demographics: {
            age: age ? Number(age) : undefined,
            occupation: occupation.trim() || undefined,
            politicalLeaning: politicalLeaning || undefined,
          },
          isActive: true,
        });
      }

      const conversationId = await createConversation({
        title: "New Debate",
        personaId,
        topicId: topicId as TopicId,
        maxRounds: Math.min(Math.max(Number(maxRounds) || 10, 1), 30),
      });

      onOpenChange(false);
      router.push(`/llm-conversations/${conversationId}`);
    } catch (err) {
      setError("Failed to create debate. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 shrink-0">
          <SheetTitle>New LLM Debate</SheetTitle>
          <SheetDescription>
            Set up a persona and pick a topic. An agent will be assigned
            randomly.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 pb-6 space-y-6"
        >
          {/* ── Persona Section ── */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Persona
            </p>

            {/* Reuse dropdown */}
            <div className="space-y-1.5">
              <Label>Use existing persona</Label>
              <Select
                value={personaMode}
                onValueChange={handlePersonaModeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Create new persona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={REUSE_NEW}>
                    + Create new persona
                  </SelectItem>
                  {uniquePersonas.length > 0 && (
                    <>
                      <Separator className="my-1" />
                      {uniquePersonas.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              {!isNewPersona && (
                <p className="text-xs text-muted-foreground">
                  Fields pre-filled from this persona — you can edit before
                  starting.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Background Bio *</Label>
              <Textarea
                id="bio"
                placeholder="Describe who this person is, their background, values, and life experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stance">Initial Stance *</Label>
              <Textarea
                id="stance"
                placeholder="How does this person feel about the debate topic?"
                value={stance}
                onChange={(e) => setStance(e.target.value)}
                rows={2}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Debate Style</Label>
              <Select
                value={debateStyle}
                onValueChange={(v) => setDebateStyle(v as DebateStyle)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEBATE_STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* ── Demographics Section ── */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Demographics (optional)
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={18}
                  max={100}
                  placeholder="e.g. 42"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  placeholder="e.g. Teacher"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Political Leaning</Label>
              <Select
                value={politicalLeaning}
                onValueChange={(v) =>
                  setPoliticalLeaning(v as PoliticalLeaning)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select leaning (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {POLITICAL_LEANINGS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* ── Debate Config Section ── */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Debate Setup
            </p>

            <div className="space-y-1.5">
              <Label>Topic *</Label>
              <Select value={topicId} onValueChange={setTopicId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a topic..." />
                </SelectTrigger>
                <SelectContent>
                  {topics === undefined ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : topics.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No topics — add them in admin dashboard
                    </SelectItem>
                  ) : (
                    topics.map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.issue}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rounds">Rounds (max 30)</Label>
              <Input
                id="rounds"
                type="number"
                min={1}
                max={30}
                value={maxRounds}
                onChange={(e) => setMaxRounds(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Each round = one persona message + one agent response. Agent
                assigned randomly at start.
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Creating debate..." : "Start Debate"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default NewDebateSheet;
