"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useGetAllSurveyResponses } from "@/features/survey/hooks/use-surveys";
import { useGetTopics } from "@/features/admin/settings/hooks/use-topics";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DivergingLikertChart,
  buildDivergingData,
  buildPoliticalPieData,
  buildPoliticalBarData,
  POLITICAL_COLORS,
  type Answer,
} from "@/features/admin/analytics/components/chart-utils";

const PreSurveyReport = () => {
  const responses = useGetAllSurveyResponses();
  const topics = useGetTopics();

  if (responses === undefined || topics === undefined) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const preResponses = responses.filter((r) => r.type === "pre");
  const allAnswers = preResponses.flatMap((r) => r.answers) as Answer[];
  const total = preResponses.length;

  const aiData = buildDivergingData(allAnswers, [
    { id: "aiTrust", label: "AI Trust" },
    { id: "aiPotential", label: "AI Potential" },
  ]);

  const topicStanceByTopic = topics
    .map((topic) => {
      const stanceCounts: Record<string, number> = {};
      for (let i = 1; i <= 7; i++) stanceCounts[String(i)] = 0;
      preResponses.forEach((r) => {
        const picked = r.answers.find(
          (a) => a.questionId === "selectedTopicId" && a.value === topic._id,
        );
        if (picked) {
          const stance = r.answers.find((a) => a.questionId === "topicStance");
          if (stance && stanceCounts[stance.value] !== undefined) {
            stanceCounts[stance.value]++;
          }
        }
      });
      const n = Object.values(stanceCounts).reduce((a, b) => a + b, 0);
      if (n === 0) return null;
      return {
        label:
          topic.issue.length > 55
            ? topic.issue.slice(0, 55) + "…"
            : topic.issue,
        total: n,
        ...stanceCounts,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  const politicalPieData = buildPoliticalPieData(allAnswers);
  const politicalBarData = buildPoliticalBarData(allAnswers);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Pre-Survey Report</h2>
        <p className="text-sm text-muted-foreground">{total} responses</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DivergingLikertChart data={aiData} title="AI Attitude" />

        {topicStanceByTopic.length > 0 && (
          <DivergingLikertChart
            data={topicStanceByTopic}
            title="Initial Topic Stance"
          />
        )}

        {/* Political Orientation — Pie */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Political Orientation (Distribution)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={politicalPieData}
                    cx="50%"
                    cy="42%"
                    outerRadius={85}
                    dataKey="value"
                    isAnimationActive={false}
                    activeIndex={[]}
                    label={({ percent }) =>
                      percent > 0.04 ? `${Math.round(percent * 100)}%` : ""
                    }
                    labelLine={false}
                  >
                    {politicalPieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={POLITICAL_COLORS[i % POLITICAL_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    iconType="square"
                    iconSize={10}
                    formatter={(value) => (
                      <span style={{ fontSize: 11 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Political Orientation — Bar */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Political Orientation (Count)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={politicalBarData}
                  margin={{ top: 16, right: 8, left: -20, bottom: 64 }}
                  barSize={28}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Bar
                    dataKey="count"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive={false}
                    activeBar={false}
                  >
                    {politicalBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="top"
                      className="fill-foreground"
                      style={{ fontSize: 11, fontWeight: 500 }}
                      formatter={(v: number) => (v > 0 ? v : "")}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreSurveyReport;
