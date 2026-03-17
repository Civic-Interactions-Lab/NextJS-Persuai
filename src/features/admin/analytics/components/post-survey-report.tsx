"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { useGetAllSurveyResponses } from "@/features/survey/hooks/use-surveys";
import { useGetTopics } from "@/features/admin/settings/hooks/use-topics";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DivergingLikertChart,
  buildDivergingData,
  type Answer,
} from "@/features/admin/analytics/components/chart-utils";

const PRE_COLOR = "#3a6bc4";
const POST_COLOR = "#4e8a42";

const PostSurveyReport = () => {
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
  const postResponses = responses.filter((r) => r.type === "post");
  const postAnswers = postResponses.flatMap((r) => r.answers) as Answer[];
  const total = postResponses.length;

  const aiData = buildDivergingData(postAnswers, [
    { id: "aiTrust", label: "AI Trust" },
    { id: "aiPotential", label: "AI Potential" },
  ]);

  // Topic stance post — grouped per topic
  const topicStanceByTopic = topics
    .map((topic) => {
      const stanceCounts: Record<string, number> = {};
      for (let i = 1; i <= 7; i++) stanceCounts[String(i)] = 0;
      postResponses.forEach((r) => {
        const picked = r.answers.find(
          (a) => a.questionId === "topicId" && a.value === topic._id,
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

  // Opinion shift — avg pre vs post per topic
  const topicShiftData = topics
    .map((topic) => {
      const preStances = preResponses
        .filter((r) =>
          r.answers.some(
            (a) => a.questionId === "selectedTopicId" && a.value === topic._id,
          ),
        )
        .map((r) => {
          const s = r.answers.find((a) => a.questionId === "topicStance");
          return s ? Number(s.value) : null;
        })
        .filter((v): v is number => v !== null);

      const postStances = postResponses
        .filter((r) =>
          r.answers.some(
            (a) => a.questionId === "topicId" && a.value === topic._id,
          ),
        )
        .map((r) => {
          const s = r.answers.find((a) => a.questionId === "topicStance");
          return s ? Number(s.value) : null;
        })
        .filter((v): v is number => v !== null);

      if (preStances.length === 0 && postStances.length === 0) return null;

      const avg = (arr: number[]) =>
        arr.length > 0
          ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
          : null;

      return {
        label:
          topic.issue.length > 40
            ? topic.issue.slice(0, 40) + "…"
            : topic.issue,
        issue: topic.issue,
        pre: avg(preStances),
        post: avg(postStances),
      };
    })
    .filter(
      (d): d is NonNullable<typeof d> =>
        d !== null && (d.pre !== null || d.post !== null),
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Post-Survey Report</h2>
        <p className="text-sm text-muted-foreground">{total} responses</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DivergingLikertChart data={aiData} title="AI Attitude (Post)" />

        {topicStanceByTopic.length > 0 && (
          <DivergingLikertChart
            data={topicStanceByTopic}
            title="Topic Stance (Post)"
          />
        )}

        {topicShiftData.length > 0 && (
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Opinion Shift by Topic (Pre vs Post avg)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: PRE_COLOR,
                      display: "inline-block",
                    }}
                  />
                  Pre-survey
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: POST_COLOR,
                      display: "inline-block",
                    }}
                  />
                  Post-survey
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: topicShiftData.length * 70 + 60,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topicShiftData}
                    margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
                    barGap={4}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      domain={[1, 7]}
                      ticks={[1, 2, 3, 4, 5, 6, 7]}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={160}
                    />
                    <Bar
                      dataKey="pre"
                      fill={PRE_COLOR}
                      barSize={12}
                      radius={[0, 3, 3, 0]}
                      isAnimationActive={false}
                      activeBar={false}
                    >
                      <LabelList
                        dataKey="pre"
                        position="right"
                        className="fill-foreground"
                        style={{ fontSize: 11, fontWeight: 500 }}
                        formatter={(v: number | null) => (v != null ? v : "")}
                      />
                    </Bar>
                    <Bar
                      dataKey="post"
                      fill={POST_COLOR}
                      barSize={12}
                      radius={[0, 3, 3, 0]}
                      isAnimationActive={false}
                      activeBar={false}
                    >
                      <LabelList
                        dataKey="post"
                        position="right"
                        className="fill-foreground"
                        style={{ fontSize: 11, fontWeight: 500 }}
                        formatter={(v: number | null) => (v != null ? v : "")}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PostSurveyReport;
