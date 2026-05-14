import SurveyResultsSection from "@/features/admin/analytics/components/survey-results-section";

const AnalyticsView = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Human vs. LLM Analytics
        </h2>
        <p className="text-muted-foreground">
          Survey responses and opinion shift analysis
        </p>
      </div>
      <SurveyResultsSection />
    </div>
  );
};

export default AnalyticsView;
