"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetLlmConversations } from "@/features/llm-conversations/hooks/use-llm-conversations";
import { useGetTopics } from "@/features/admin/settings/hooks/use-topics";
import { LlmConversation } from "../../../../../convex/types/convexTypes";
import { cn } from "@/lib/utils";

const PRE_COLOR = "#3a6bc4";
const POST_COLOR = "#4e8a42";
const NEUTRAL = "#b8b4ac";

const likertLabel = (n: number) => {
  if (n === 1) return "Strongly Disagree";
  if (n === 2) return "Disagree";
  if (n === 3) return "Somewhat Disagree";
  if (n === 4) return "Neutral";
  if (n === 5) return "Somewhat Agree";
  if (n === 6) return "Agree";
  return "Strongly Agree";
};

const avg = (arr: number[]) =>
  arr.length > 0
    ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
    : null;

const shiftColor = (delta: number) => {
  if (delta > 0) return "text-green-600";
  if (delta < 0) return "text-red-500";
  return "text-muted-foreground";
};

type GroupBy = "topic" | "persona" | "conversation";

const LlmAnalyticsView = () => {
  const conversations = useGetLlmConversations();
  const topics = useGetTopics();
  const [groupBy, setGroupBy] = useState<GroupBy>("topic");
  const [selectedId, setSelectedId] = useState<string>("__all__");

  const completed = useMemo(
    () => (conversations ?? []).filter((c) => c.status === "completed"),
    [conversations],
  );

  const withRatings = useMemo(
    () => completed.filter((c) => c.preTopicRating !== undefined && c.postTopicRating !== undefined),
    [completed],
  );

  const filterOptions = useMemo(() => {
    if (groupBy === "topic") {
      const seen = new Set<string>();
      return withRatings
        .filter((c) => { const id = c.topicId; if (seen.has(id)) return false; seen.add(id); return true; })
        .map((c) => ({ id: c.topicId, label: c.metadata?.topic?.issue ?? c.topicId }));
    }
    if (groupBy === "persona") {
      const seen = new Set<string>();
      return withRatings
        .filter((c) => { const id = c.personaId; if (seen.has(id)) return false; seen.add(id); return true; })
        .map((c) => ({ id: c.personaId, label: c.metadata?.persona?.name ?? c.personaId }));
    }
    return withRatings.map((c) => ({
      id: c._id,
      label: `${c.metadata?.persona?.name ?? "?"} vs ${c.metadata?.agent?.name ?? "?"} — ${c.metadata?.topic?.issue?.slice(0, 40) ?? ""}`,
    }));
  }, [groupBy, withRatings]);

  const filtered = useMemo(() => {
    if (selectedId === "__all__") return withRatings;
    if (groupBy === "topic") return withRatings.filter((c) => c.topicId === selectedId);
    if (groupBy === "persona") return withRatings.filter((c) => c.personaId === selectedId);
    return withRatings.filter((c) => c._id === selectedId);
  }, [selectedId, groupBy, withRatings]);

  const stats = useMemo(() => {
    if (filtered.length === 0) return null;
    const shifts = filtered.map((c) => c.postTopicRating! - c.preTopicRating!);
    return {
      avgPre: avg(filtered.map((c) => c.preTopicRating!)),
      avgPost: avg(filtered.map((c) => c.postTopicRating!)),
      avgShift: avg(shifts),
      persuaded: shifts.filter((s) => Math.abs(s) >= 1).length,
      unchanged: shifts.filter((s) => s === 0).length,
      movedUp: shifts.filter((s) => s > 0).length,
      movedDown: shifts.filter((s) => s < 0).length,
      total: filtered.length,
    };
  }, [filtered]);

  const shiftDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (let i = -6; i <= 6; i++) counts[String(i)] = 0;
    filtered.forEach((c) => {
      const delta = c.postTopicRating! - c.preTopicRating!;
      counts[String(delta)] = (counts[String(delta)] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([delta, count]) => ({ delta: Number(delta), count }))
      .filter((d) => d.count > 0 || (d.delta >= -3 && d.delta <= 3));
  }, [filtered]);

  const groupedBarData = useMemo(() => {
    if (groupBy === "conversation") return [];
    const groups: Record<string, { label: string; convs: LlmConversation[] }> = {};
    filtered.forEach((c) => {
      const key = groupBy === "topic" ? c.topicId : c.personaId;
      const label = groupBy === "topic"
        ? (c.metadata?.topic?.issue?.slice(0, 45) ?? key)
        : (c.metadata?.persona?.name ?? key);
      if (!groups[key]) groups[key] = { label, convs: [] };
      groups[key].convs.push(c);
    });
    return Object.values(groups).map(({ label, convs }) => ({
      label,
      pre: avg(convs.map((c) => c.preTopicRating!)),
      post: avg(convs.map((c) => c.postTopicRating!)),
      n: convs.length,
    }));
  }, [filtered, groupBy]);

  const debateStyleData = useMemo(() => {
    const byStyle: Record<string, number[]> = {};
    filtered.forEach((c) => {
      const style = c.metadata?.persona?.debateStyle ?? "unknown";
      if (!byStyle[style]) byStyle[style] = [];
      byStyle[style].push(c.postTopicRating! - c.preTopicRating!);
    });
    return Object.entries(byStyle).map(([style, shifts]) => ({
      style: style.charAt(0).toUpperCase() + style.slice(1),
      avgShift: avg(shifts) ?? 0,
      total: shifts.length,
    }));
  }, [filtered]);

  const agentData = useMemo(() => {
    const byAgent: Record<string, { name: string; shifts: number[] }> = {};
    filtered.forEach((c) => {
      const id = c.agentId;
      if (!byAgent[id]) byAgent[id] = { name: c.metadata?.agent?.name ?? "Unknown", shifts: [] };
      byAgent[id].shifts.push(c.postTopicRating! - c.preTopicRating!);
    });
    return Object.values(byAgent).map(({ name, shifts }) => ({
      name,
      avgShift: avg(shifts) ?? 0,
      total: shifts.length,
    }));
  }, [filtered]);

  const scatterData = useMemo(() =>
    filtered.map((c) => ({
      pre: c.preTopicRating!,
      post: c.postTopicRating!,
      shift: c.postTopicRating! - c.preTopicRating!,
      name: c.metadata?.persona?.name ?? "",
      topic: c.metadata?.topic?.issue ?? "",
    })),
    [filtered],
  );

  if (conversations === undefined || topics === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (completed.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">LLM vs. LLM Analytics</h2>
          <p className="text-muted-foreground">Debate outcomes, persuasion shifts, and per-round ratings</p>
        </div>
        <div className="flex items-center justify-center h-64 rounded-lg border bg-card text-muted-foreground text-sm">
          No completed debates yet
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">LLM vs. LLM Analytics</h2>
          <p className="text-muted-foreground">
            {completed.length} completed · {withRatings.length} with ratings · showing {filtered.length}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select value={groupBy} onValueChange={(v) => { setGroupBy(v as GroupBy); setSelectedId("__all__"); }}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="topic">By Topic</SelectItem>
              <SelectItem value="persona">By Persona</SelectItem>
              <SelectItem value="conversation">By Debate</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All</SelectItem>
              {filterOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {stats && (
        <>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <StatCard
              label="Avg Pre-Rating"
              value={stats.avgPre !== null ? `${stats.avgPre}/7` : "—"}
              sub={stats.avgPre ? likertLabel(Math.round(stats.avgPre)) : ""}
            />
            <StatCard
              label="Avg Post-Rating"
              value={stats.avgPost !== null ? `${stats.avgPost}/7` : "—"}
              sub={stats.avgPost ? likertLabel(Math.round(stats.avgPost)) : ""}
            />
            <StatCard
              label="Avg Opinion Shift"
              value={stats.avgShift !== null ? (stats.avgShift > 0 ? `+${stats.avgShift}` : String(stats.avgShift)) : "—"}
              valueClass={stats.avgShift !== null ? shiftColor(stats.avgShift) : ""}
              sub="post minus pre"
            />
            <StatCard
              label="Persuaded"
              value={`${stats.persuaded}/${stats.total}`}
              sub={`${Math.round((stats.persuaded / stats.total) * 100)}% shifted ≥1 point`}
            />
          </div>
          <div className="grid gap-4 grid-cols-3">
            <MiniStat label="Moved toward agreement" value={stats.movedUp} color="text-green-600" />
            <MiniStat label="No change" value={stats.unchanged} color="text-muted-foreground" />
            <MiniStat label="Moved toward disagreement" value={stats.movedDown} color="text-red-500" />
          </div>
        </>
      )}

      {groupedBarData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Pre vs Post Rating — by {groupBy === "topic" ? "Topic" : "Persona"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
              <LegendDot color={PRE_COLOR} label="Pre-debate" />
              <LegendDot color={POST_COLOR} label="Post-debate" />
            </div>
            <div style={{ width: "100%", height: groupedBarData.length * 70 + 60 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={groupedBarData} margin={{ top: 4, right: 48, left: 8, bottom: 4 }} barGap={4}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" domain={[1, 7]} ticks={[1, 2, 3, 4, 5, 6, 7]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={180} />
                  <Tooltip content={({ payload, label }) => {
                    if (!payload?.length) return null;
                    const pre = payload.find((p) => p.dataKey === "pre")?.value;
                    const post = payload.find((p) => p.dataKey === "post")?.value;
                    const shift = pre != null && post != null ? ((post as number) - (pre as number)).toFixed(1) : null;
                    return (
                      <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
                        <p className="font-medium mb-1 max-w-[200px] whitespace-normal">{label}</p>
                        <p>Pre: {pre}/7</p>
                        <p>Post: {post}/7</p>
                        {shift !== null && <p>Shift: {Number(shift) > 0 ? "+" : ""}{shift}</p>}
                      </div>
                    );
                  }} />
                  <Bar dataKey="pre" fill={PRE_COLOR} barSize={12} radius={[0, 3, 3, 0]} isAnimationActive={false} activeBar={false}>
                    <LabelList dataKey="pre" position="right" style={{ fontSize: 11, fontWeight: 500 }} formatter={(v: number | null) => v ?? ""} />
                  </Bar>
                  <Bar dataKey="post" fill={POST_COLOR} barSize={12} radius={[0, 3, 3, 0]} isAnimationActive={false} activeBar={false}>
                    <LabelList dataKey="post" position="right" style={{ fontSize: 11, fontWeight: 500 }} formatter={(v: number | null) => v ?? ""} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {shiftDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Shift Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Post minus pre — negative = moved away, positive = moved toward agreement</p>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shiftDistribution} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="delta" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <ReferenceLine x={0} stroke={NEUTRAL} strokeDasharray="4 4" />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]} isAnimationActive={false} fill={POST_COLOR}
                      label={{ position: "top", fontSize: 10, formatter: (v: number) => v > 0 ? v : "" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {scatterData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Pre vs Post (per debate)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Above the diagonal = shifted toward agreement</p>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 4, right: 8, left: -20, bottom: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="pre" domain={[1, 7]} ticks={[1, 2, 3, 4, 5, 6, 7]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} name="Pre" label={{ value: "Pre", position: "insideBottom", offset: -8, fontSize: 11 }} />
                    <YAxis type="number" dataKey="post" domain={[1, 7]} ticks={[1, 2, 3, 4, 5, 6, 7]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} name="Post" />
                    <ZAxis range={[40, 40]} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ payload }) => {
                      if (!payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
                          <p className="font-medium">{d.name}</p>
                          <p className="text-muted-foreground max-w-[180px] whitespace-normal">{d.topic}</p>
                          <p>Pre: {d.pre}/7 · Post: {d.post}/7 · Shift: {d.shift > 0 ? "+" : ""}{d.shift}</p>
                        </div>
                      );
                    }} />
                    <ReferenceLine segment={[{ x: 1, y: 1 }, { x: 7, y: 7 }]} stroke={NEUTRAL} strokeDasharray="4 4" />
                    <Scatter data={scatterData} fill={PRE_COLOR} fillOpacity={0.7} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {debateStyleData.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Avg Shift by Debate Style</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Which persona styles are most susceptible to persuasion</p>
              <div style={{ width: "100%", height: Math.max(160, debateStyleData.length * 50 + 40) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={debateStyleData} margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" domain={[-3, 3]} ticks={[-3, -2, -1, 0, 1, 2, 3]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="style" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
                    <ReferenceLine x={0} stroke={NEUTRAL} />
                    <Bar dataKey="avgShift" barSize={14} radius={[0, 3, 3, 0]} isAnimationActive={false} activeBar={false} fill={POST_COLOR}>
                      <LabelList dataKey="avgShift" position="right" style={{ fontSize: 11, fontWeight: 500 }} formatter={(v: number) => v > 0 ? `+${v}` : v} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {agentData.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Avg Shift by Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Which agents are most persuasive</p>
              <div style={{ width: "100%", height: Math.max(160, agentData.length * 50 + 40) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={agentData} margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" domain={[-3, 3]} ticks={[-3, -2, -1, 0, 1, 2, 3]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={120} />
                    <ReferenceLine x={0} stroke={NEUTRAL} />
                    <Bar dataKey="avgShift" barSize={14} radius={[0, 3, 3, 0]} isAnimationActive={false} activeBar={false} fill={PRE_COLOR}>
                      <LabelList dataKey="avgShift" position="right" style={{ fontSize: 11, fontWeight: 500 }} formatter={(v: number) => v > 0 ? `+${v}` : v} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <PerDebateTable conversations={filtered} />
    </div>
  );
};

export default LlmAnalyticsView;

const StatCard = ({ label, value, sub, valueClass }: { label: string; value: string; sub?: string; valueClass?: string }) => (
  <div className="rounded-lg border bg-card p-5">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={cn("text-2xl font-bold", valueClass)}>{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
  </div>
);

const MiniStat = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="rounded-lg border bg-card p-4 text-center">
    <p className={cn("text-3xl font-bold", color)}>{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </div>
);

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <span className="flex items-center gap-1.5">
    <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
    {label}
  </span>
);

const PerDebateTable = ({ conversations }: { conversations: LlmConversation[] }) => {
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Per-Debate Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="text-left py-2 pr-4 font-medium">Persona</th>
              <th className="text-left py-2 pr-4 font-medium">Agent</th>
              <th className="text-left py-2 pr-4 font-medium">Topic</th>
              <th className="text-left py-2 pr-4 font-medium">Style</th>
              <th className="text-center py-2 pr-4 font-medium">Rounds</th>
              <th className="text-center py-2 pr-4 font-medium">Pre</th>
              <th className="text-center py-2 pr-4 font-medium">Post</th>
              <th className="text-center py-2 font-medium">Shift</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const shift = c.postTopicRating! - c.preTopicRating!;
              return (
                <tr key={c._id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-2 pr-4">{c.metadata?.persona?.name ?? "—"}</td>
                  <td className="py-2 pr-4">{c.metadata?.agent?.name ?? "—"}</td>
                  <td className="py-2 pr-4 max-w-[180px] truncate">{c.metadata?.topic?.issue ?? "—"}</td>
                  <td className="py-2 pr-4 capitalize">{c.metadata?.persona?.debateStyle ?? "—"}</td>
                  <td className="py-2 pr-4 text-center">{c.roundCount}</td>
                  <td className="py-2 pr-4 text-center">{c.preTopicRating}/7</td>
                  <td className="py-2 pr-4 text-center">{c.postTopicRating}/7</td>
                  <td className={cn("py-2 text-center font-semibold", shiftColor(shift))}>
                    {shift > 0 ? `+${shift}` : shift}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
