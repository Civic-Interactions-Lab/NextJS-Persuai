"use client";

import { useState, useEffect } from "react";
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
import { useGetAgents } from "@/features/admin/settings/hooks/use-agents";
import {
  useGetLlmPersonas,
  useCreateLlmPersona,
} from "@/features/llm-conversations/hooks/use-llm-personas";
import { useCreateLlmConversation } from "@/features/llm-conversations/hooks/use-llm-conversations";
import { TopicId, AgentId, LlmPersonaId } from "../../../../convex/types/convexTypes";

// ── Option lists ─────────────────────────────────────────────────────────────

const DEBATE_STYLES = [
  { value: "logical", label: "Logical" },
  { value: "emotional", label: "Emotional" },
  { value: "aggressive", label: "Aggressive" },
  { value: "cautious", label: "Cautious" },
  { value: "balanced", label: "Balanced" },
] as const;

const AGE_RANGES = [
  { value: "gen_z", label: "Gen Z (born 1997–2012)" },
  { value: "millennial", label: "Millennial (born 1981–1996)" },
  { value: "gen_x", label: "Gen X (born 1965–1980)" },
  { value: "boomer", label: "Baby Boomer (born 1946–1964)" },
  { value: "silent", label: "Silent Generation (born 1928–1945)" },
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

const EDUCATION_LEVELS = [
  { value: "high_school", label: "High School Diploma" },
  { value: "some_college", label: "Some College" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "graduate", label: "Graduate Degree" },
] as const;

const LOCATIONS = [
  { value: "urban", label: "Urban" },
  { value: "suburban", label: "Suburban" },
  { value: "rural", label: "Rural" },
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

type DebateStyle = "logical" | "emotional" | "aggressive" | "cautious" | "balanced";
type PoliticalLeaning = "far_left" | "left" | "center_left" | "center" | "center_right" | "right" | "far_right";
type AgeRange = "gen_z" | "millennial" | "gen_x" | "boomer" | "silent";
type Education = "high_school" | "some_college" | "bachelor" | "graduate";
type Location = "urban" | "suburban" | "rural";

interface NewDebateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REUSE_NEW = "__new__";

// ── Component ─────────────────────────────────────────────────────────────────

const NewDebateSheet = ({ open, onOpenChange }: NewDebateSheetProps) => {
  const router = useRouter();
  const topics = useGetTopics();
  const agents = useGetAgents();
  const existingPersonas = useGetLlmPersonas();
  const createPersona = useCreateLlmPersona();
  const createConversation = useCreateLlmConversation();

  // Persona mode — REUSE_NEW or an existing persona _id
  const [personaMode, setPersonaMode] = useState<string>(REUSE_NEW);

  // Persona fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [debateStyle, setDebateStyle] = useState<DebateStyle>("balanced");

  // Demographics
  const [ageRange, setAgeRange] = useState<AgeRange | "">("");
  const [occupation, setOccupation] = useState("");
  const [politicalLeaning, setPoliticalLeaning] = useState<PoliticalLeaning | "">("");
  const [education, setEducation] = useState<Education | "">("");
  const [religion, setReligion] = useState("");
  const [location, setLocation] = useState<Location | "">("");

  // Debate config
  const [topicId, setTopicId] = useState<string>("");
  const [agentId, setAgentId] = useState<string>("");
  const [maxRounds, setMaxRounds] = useState("30");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isReusingExisting = personaMode !== REUSE_NEW;

  // Auto-select first agent when list loads
  useEffect(() => {
    if (agents && agents.length > 0 && !agentId) {
      setAgentId(agents[0]._id);
    }
  }, [agents, agentId]);

  // Reset all fields when sheet opens
  useEffect(() => {
    if (open) {
      setPersonaMode(REUSE_NEW);
      setName("");
      setBio("");
      setDebateStyle("balanced");
      setAgeRange("");
      setOccupation("");
      setPoliticalLeaning("");
      setEducation("");
      setReligion("");
      setLocation("");
      setTopicId("");
      setMaxRounds("30");
      setError("");
      // Re-select first agent
      if (agents && agents.length > 0) setAgentId(agents[0]._id);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Deduplicate personas by name — keep only the most recently created per name
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

  const handlePersonaModeChange = (value: string) => {
    setPersonaMode(value);
    if (value !== REUSE_NEW) {
      const p = existingPersonas?.find((p) => p._id === value);
      if (p) {
        setName(p.name);
        setBio(p.bio);
        setDebateStyle(p.debateStyle as DebateStyle);
        setAgeRange((p.demographics.ageRange as AgeRange) ?? "");
        setOccupation(p.demographics.occupation ?? "");
        setPoliticalLeaning((p.demographics.politicalLeaning as PoliticalLeaning) ?? "");
        setEducation((p.demographics.education as Education) ?? "");
        setReligion((p.demographics.religion as string) ?? "");
        setLocation((p.demographics.location as Location) ?? "");
      }
    } else {
      setName("");
      setBio("");
      setDebateStyle("balanced");
      setAgeRange("");
      setOccupation("");
      setPoliticalLeaning("");
      setEducation("");
      setReligion("");
      setLocation("");
    }
  };

  const isValid =
    topicId &&
    agentId &&
    (isReusingExisting ? true : name.trim() && bio.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError("");
    setIsSubmitting(true);

    try {
      let personaId: LlmPersonaId;

      if (isReusingExisting) {
        // Reuse the existing persona directly — no new DB record
        personaId = personaMode as LlmPersonaId;
      } else {
        personaId = await createPersona({
          name: name.trim(),
          bio: bio.trim(),
          debateStyle,
          demographics: {
            ageRange: ageRange || undefined,
            occupation: occupation.trim() || undefined,
            politicalLeaning: politicalLeaning || undefined,
            education: education || undefined,
            religion: religion.trim() || undefined,
            location: location || undefined,
          },
          isActive: true,
        });
      }

      const conversationId = await createConversation({
        title: "New Debate",
        personaId,
        agentId: agentId as AgentId,
        topicId: topicId as TopicId,
        maxRounds: Math.min(Math.max(Number(maxRounds) || 30, 1), 30),
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
            Configure a persona, pick an agent, and choose a topic.
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

            <div className="space-y-1.5">
              <Label>Use existing persona</Label>
              <Select value={personaMode} onValueChange={handlePersonaModeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Create new persona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={REUSE_NEW}>+ Create new persona</SelectItem>
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
              {isReusingExisting && (
                <p className="text-xs text-muted-foreground">
                  Reusing saved persona — fields are read-only.
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
                disabled={isReusingExisting}
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
                disabled={isReusingExisting}
                required
              />
            </div>


            <div className="space-y-1.5">
              <Label>Debate Style</Label>
              <Select
                value={debateStyle}
                onValueChange={(v) => setDebateStyle(v as DebateStyle)}
                disabled={isReusingExisting}
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
                <Label>Generation</Label>
                <Select
                  value={ageRange}
                  onValueChange={(v) => setAgeRange(v as AgeRange)}
                  disabled={isReusingExisting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_RANGES.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  placeholder="e.g. Teacher"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  disabled={isReusingExisting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Political Leaning</Label>
                <Select
                  value={politicalLeaning}
                  onValueChange={(v) => setPoliticalLeaning(v as PoliticalLeaning)}
                  disabled={isReusingExisting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
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

              <div className="space-y-1.5">
                <Label>Education</Label>
                <Select
                  value={education}
                  onValueChange={(v) => setEducation(v as Education)}
                  disabled={isReusingExisting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="religion">Religion</Label>
                <Input
                  id="religion"
                  placeholder="e.g. Catholic, Atheist"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  disabled={isReusingExisting}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Location Type</Label>
                <Select
                  value={location}
                  onValueChange={(v) => setLocation(v as Location)}
                  disabled={isReusingExisting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : topics.length === 0 ? (
                    <SelectItem value="none" disabled>No topics — add them in admin dashboard</SelectItem>
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
              <Label>Agent *</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an agent..." />
                </SelectTrigger>
                <SelectContent>
                  {agents === undefined ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : agents.length === 0 ? (
                    <SelectItem value="none" disabled>No agents — add them in admin settings</SelectItem>
                  ) : (
                    agents.map((a) => (
                      <SelectItem key={a._id} value={a._id}>
                        {a.name}
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
