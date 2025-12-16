import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Activity, PieChart as PieChartIcon } from "lucide-react";
import type { CodeMetrics } from "@/utils/codeAnalysis";

interface ComplexityChartProps {
  metrics: CodeMetrics;
  issueBreakdown: { critical: number; warning: number; info: number };
}

export const ComplexityChart = ({ metrics, issueBreakdown }: ComplexityChartProps) => {
  // Bar chart data for code composition
  const compositionData = [
    { name: 'Code', lines: metrics.codeLines, fill: 'hsl(var(--primary))' },
    { name: 'Comments', lines: metrics.commentLines, fill: 'hsl(var(--success))' },
    { name: 'Blank', lines: metrics.blankLines, fill: 'hsl(var(--muted-foreground))' },
  ];

  // Radar chart data for code health
  const healthData = [
    { subject: 'Simplicity', value: Math.max(0, 100 - metrics.complexity * 5), fullMark: 100 },
    { subject: 'Documentation', value: Math.min(100, (metrics.commentLines / (metrics.codeLines || 1)) * 500), fullMark: 100 },
    { subject: 'Modularity', value: Math.min(100, metrics.functions * 15), fullMark: 100 },
    { subject: 'Structure', value: Math.min(100, metrics.classes * 25 + 50), fullMark: 100 },
    { subject: 'Conciseness', value: Math.max(0, 100 - (metrics.linesOfCode / 10)), fullMark: 100 },
  ];

  // Pie chart data for issues
  const issueData = [
    { name: 'Critical', value: issueBreakdown.critical, color: 'hsl(var(--destructive))' },
    { name: 'Warning', value: issueBreakdown.warning, color: 'hsl(var(--warning))' },
    { name: 'Info', value: issueBreakdown.info, color: 'hsl(var(--info))' },
  ].filter(d => d.value > 0);

  // Complexity level indicator
  const getComplexityLevel = (complexity: number) => {
    if (complexity <= 5) return { label: 'Low', color: 'text-success', description: 'Easy to maintain' };
    if (complexity <= 10) return { label: 'Moderate', color: 'text-info', description: 'Manageable complexity' };
    if (complexity <= 15) return { label: 'High', color: 'text-warning', description: 'Consider refactoring' };
    return { label: 'Very High', color: 'text-destructive', description: 'Needs immediate attention' };
  };

  const complexityLevel = getComplexityLevel(metrics.complexity);

  return (
    <Card className="card-gradient border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Code Complexity Visualization
        </CardTitle>
        <CardDescription>
          Visual breakdown of your code metrics and health indicators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Complexity Gauge */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
          <div>
            <h4 className="font-semibold">Cyclomatic Complexity</h4>
            <p className="text-sm text-muted-foreground">{complexityLevel.description}</p>
          </div>
          <div className="text-right">
            <span className={`text-4xl font-bold ${complexityLevel.color}`}>{metrics.complexity}</span>
            <p className={`text-sm font-medium ${complexityLevel.color}`}>{complexityLevel.label}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Code Composition Bar Chart */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Code Composition
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compositionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="lines" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Code Health Radar */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Code Health Radar
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={healthData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Radar
                    name="Health"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Issue Distribution Pie Chart */}
        {issueData.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Issue Distribution
            </h4>
            <div className="flex items-center gap-8">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={issueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {issueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2">
                {issueData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Maintainability Index */}
        <div className="p-4 rounded-lg bg-background/50 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Maintainability Index</h4>
            <span className="text-2xl font-bold text-primary">
              {Math.round(Math.max(0, 171 - 5.2 * Math.log(metrics.complexity + 1) - 0.23 * metrics.linesOfCode + 16.2 * Math.log((metrics.commentLines || 1) + 1)))}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Based on Halstead Volume, Cyclomatic Complexity, and Lines of Code. Score above 85 indicates high maintainability.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
