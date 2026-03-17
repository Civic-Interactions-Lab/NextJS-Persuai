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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const LIKERT_SEGMENTS = [
  { key: "1", label: "Strongly disagree", color: "#8b2020" },
  { key: "2", label: "Disagree", color: "#c0392b" },
  { key: "3", label: "Somewhat disagree", color: "#d4956a" },
  { key: "4", label: "Neutral", color: "#b8b4ac" },
  { key: "5", label: "Somewhat agree", color: "#8aad7e" },
  { key: "6", label: "Agree", color: "#4e8a42" },
  { key: "7", label: "Strongly agree", color: "#2d5c22" },
];

export const POLITICAL_COLORS = [
  "#3a6bc4",
  "#5b8fd6",
  "#7ab3d4",
  "#b8b4ac",
  "#d4956a",
  "#c0392b",
  "#8b2020",
];

export const POLITICAL_LABELS: Record<string, string> = {
  "1": "Very liberal",
  "2": "Liberal",
  "3": "Slightly liberal",
  "4": "Moderate",
  "5": "Slightly conservative",
  "6": "Conservative",
  "7": "Very conservative",
};

export type Answer = { questionId: string; value: string };

export const buildDivergingData = (
  answers: Answer[],
  questions: { id: string; label: string }[],
) =>
  questions.map(({ id, label }) => {
    const counts: Record<string, number> = {};
    for (let i = 1; i <= 7; i++) counts[String(i)] = 0;
    answers
      .filter((a) => a.questionId === id)
      .forEach((a) => {
        if (counts[a.value] !== undefined) counts[a.value]++;
      });
    const total = answers.filter((a) => a.questionId === id).length;
    return { label, total, ...counts };
  });

export const buildPoliticalPieData = (answers: Answer[]) => {
  const counts: Record<string, number> = {};
  answers
    .filter((a) => a.questionId === "politicalOrientation")
    .forEach((a) => {
      const label = POLITICAL_LABELS[a.value] ?? a.value;
      counts[label] = (counts[label] || 0) + 1;
    });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

export const buildPoliticalBarData = (answers: Answer[]) => {
  const counts: Record<string, number> = {};
  for (let i = 1; i <= 7; i++) counts[String(i)] = 0;
  answers
    .filter((a) => a.questionId === "politicalOrientation")
    .forEach((a) => {
      if (counts[a.value] !== undefined) counts[a.value]++;
    });
  return Object.entries(counts).map(([value, count]) => ({
    label: POLITICAL_LABELS[value] ?? value,
    count,
    fill: POLITICAL_COLORS[Number(value) - 1] ?? "#888",
  }));
};

export const DivergingLikertChart = ({
  data,
  title,
}: {
  data: ReturnType<typeof buildDivergingData>;
  title: string;
}) => {
  const height = Math.max(data.length * 56 + 60, 120);
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
          {LIKERT_SEGMENTS.map(({ key, label, color }) => (
            <span
              key={key}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {label}
            </span>
          ))}
        </div>
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
              barSize={28}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={130}
              />
              {LIKERT_SEGMENTS.map(({ key, color }) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={color}
                  isAnimationActive={false}
                  activeBar={false}
                >
                  <LabelList
                    dataKey={key}
                    position="inside"
                    style={{ fontSize: 11, fill: "#fff", fontWeight: 500 }}
                    formatter={(v: number) => (v > 0 ? v : "")}
                  />
                </Bar>
              ))}
              <Bar
                dataKey="total"
                stackId="b"
                fill="transparent"
                isAnimationActive={false}
                activeBar={false}
              >
                <LabelList
                  dataKey="total"
                  position="right"
                  className="fill-foreground"
                  style={{ fontSize: 12, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
