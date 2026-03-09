"use client";

import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetAllSurveyResponses } from "@/features/survey/hooks/use-surveys";

interface SurveyResponse {
  name: string;
  background: string;
  experience: string;
}

const SurveyResultsSection = () => {
  const responses = useGetAllSurveyResponses();

  if (responses === undefined) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Parse responses and count
  const parsedResponses: SurveyResponse[] = responses
    .map((r) => {
      try {
        return JSON.parse(r.externalId) as SurveyResponse;
      } catch {
        return null;
      }
    })
    .filter((r): r is SurveyResponse => r !== null);

  // Calculate statistics
  const backgroundCounts = parsedResponses.reduce(
    (acc, r) => {
      acc[r.background] = (acc[r.background] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const experienceCounts = parsedResponses.reduce(
    (acc, r) => {
      acc[r.experience] = (acc[r.experience] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Survey Results</h3>
        <p className="text-sm text-muted-foreground">
          {parsedResponses.length} total responses
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Background Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Background</CardTitle>
            <CardDescription>
              Distribution of participant backgrounds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(backgroundCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([background, count]) => {
                  const percentage = (
                    (count / parsedResponses.length) *
                    100
                  ).toFixed(1);
                  return (
                    <div key={background} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{background}</span>
                        <span className="text-muted-foreground">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Experience Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Experience Level</CardTitle>
            <CardDescription>Distribution of experience levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(experienceCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([experience, count]) => {
                  const percentage = (
                    (count / parsedResponses.length) *
                    100
                  ).toFixed(1);
                  return (
                    <div key={experience} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{experience}</span>
                        <span className="text-muted-foreground">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Responses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Responses</CardTitle>
          <CardDescription>Latest survey submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {parsedResponses.slice(0, 10).map((response, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium">{response.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {response.background} • {response.experience}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyResultsSection;
