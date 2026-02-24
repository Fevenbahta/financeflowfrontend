import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { aiApi } from "@/services/api";
import { 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Target,
  PiggyBank,
  Calendar,
  ChevronRight,
  Brain,
  Shield,
  Zap,
  DollarSign,
  Wallet,
  Coffee,
  ShoppingBag,
  Home,
  Car,
  Heart,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AIAnalysis {
  insight: string;
  spendingAnalysis: Array<{
    category: string;
    trend: 'up' | 'down' | 'stable';
    percentageChange: number;
    recommendation: string;
  }>;
  anomalies: Array<{
    id: string;
    date: Date;
    amount: number;
    category: string | null;
    description: string | null;
    reason: string;
  }>;
  budgetHealth: Array<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    status: 'on_track' | 'overspending' | 'under_spending';
  }>;
  savingsOpportunities: Array<{
    type: string;
    potentialSavings: number;
    suggestion: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  cashFlowForecast: {
    projectedBalance: number;
    daysUntilZero: number | null;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
}

// Category icons mapping
const categoryIcons: Record<string, any> = {
  'Food': Coffee,
  'Shopping': ShoppingBag,
  'Housing': Home,
  'Transportation': Car,
  'Healthcare': Heart,
  'Entertainment': Activity,
  'default': Wallet
};

const Insights = () => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await aiApi.analyze();
      // Transform the API response to match AIAnalysis interface
      const transformedAnalysis: AIAnalysis = {
        insight: res.insight,
        spendingAnalysis: [],
        anomalies: [],
        budgetHealth: [],
        savingsOpportunities: [],
        cashFlowForecast: {
          projectedBalance: 0,
          daysUntilZero: null,
          riskLevel: 'low',
          recommendations: []
        }
      };
      setAnalysis(transformedAnalysis);
    } catch (err: any) {
      toast.error(err.message || "Could not fetch AI insights");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
  };

  useEffect(() => { fetchInsights(); }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'low': return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
      case 'high': return 'text-red-600 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-600 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'on_track': return 'text-green-600';
      case 'overspending': return 'text-red-600';
      case 'under_spending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category: string | null) => {
    const Icon = categoryIcons[category || 'default'] || categoryIcons.default;
    return <Icon className="w-4 h-4" />;
  };

  // Safe accessors for nested properties
  const getRiskLevel = () => {
    return analysis?.cashFlowForecast?.riskLevel || 'low';
  };

  const getProjectedBalance = () => {
    return analysis?.cashFlowForecast?.projectedBalance || 0;
  };

  const getDaysUntilZero = () => {
    return analysis?.cashFlowForecast?.daysUntilZero || null;
  };

  const getRecommendations = () => {
    return analysis?.cashFlowForecast?.recommendations || [];
  };

  const getBudgetHealth = () => {
    return analysis?.budgetHealth || [];
  };

  const getSpendingAnalysis = () => {
    return analysis?.spendingAnalysis || [];
  };

  const getAnomalies = () => {
    return analysis?.anomalies || [];
  };

  const getSavingsOpportunities = () => {
    return analysis?.savingsOpportunities || [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">AI Financial Advisor</h1>
          <p className="text-muted-foreground mt-1">Intelligent insights powered by machine learning</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={loading} 
          variant="outline" 
          className="rounded-xl gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> 
          Refresh Analysis
        </Button>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        {/* AI Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/50">
          <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center shadow-glow">
            <Brain className="w-8 h-8 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-display font-bold text-foreground">Smart Analysis</h2>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                <Zap className="w-3 h-3 mr-1" /> Real-time AI
              </Badge>
              {analysis && (
                <Badge variant="outline" className={getRiskColor(getRiskLevel())}>
                  {getRiskLevel().toUpperCase()} RISK
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Analyzing your spending patterns, detecting anomalies, and finding opportunities
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-6 h-6 text-accent animate-pulse" />
              </div>
            </div>
          </div>
        ) : analysis ? (
          <>
            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-2xl">
                <TabsTrigger value="overview" className="data-[state=active]:bg-accent/20">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="spending" className="data-[state=active]:bg-accent/20">
                  Spending
                </TabsTrigger>
                <TabsTrigger value="anomalies" className="data-[state=active]:bg-accent/20">
                  Anomalies
                  {getAnomalies().length > 0 && (
                    <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                      {getAnomalies().length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="opportunities" className="data-[state=active]:bg-accent/20">
                  Opportunities
                  {getSavingsOpportunities().length > 0 && (
                    <Badge className="ml-2 px-1.5 py-0.5 text-xs bg-green-500">
                      {getSavingsOpportunities().length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                {/* Overview Tab - Added unique key */}
                {activeTab === "overview" && (
                  <motion.div
                    key="overview-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Main Insight Card */}
                    <div className="bg-gradient-to-br from-accent/5 via-accent/5 to-transparent rounded-2xl p-6 border border-accent/20">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                        <p className="text-foreground leading-relaxed text-lg">{analysis.insight}</p>
                      </div>
                    </div>

                    {/* Cash Flow Forecast Card */}
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Calendar className="w-4 h-4 text-accent" />
                          Cash Flow Forecast
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Projected Balance (3 months)</p>
                            <p className="text-2xl font-bold">{formatCurrency(getProjectedBalance())}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Risk Level</p>
                            <Badge className={`${getRiskColor(getRiskLevel())} px-3 py-1`}>
                              {getRiskLevel().toUpperCase()}
                            </Badge>
                          </div>
                          {getDaysUntilZero() && (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Est. Days Until Zero</p>
                              <p className="text-2xl font-bold text-red-500">{getDaysUntilZero()} days</p>
                            </div>
                          )}
                        </div>
                        
                        {getRecommendations().length > 0 && (
                          <div className="mt-4 bg-yellow-500/5 rounded-xl p-4 border border-yellow-500/20">
                            <p className="text-sm font-medium mb-2 flex items-center gap-2 text-yellow-700">
                              <AlertTriangle className="w-4 h-4" />
                              Recommendations
                            </p>
                            <ul className="space-y-2">
                              {getRecommendations().map((rec, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <ChevronRight className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Budget Health Card */}
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Target className="w-4 h-4 text-accent" />
                          Budget Health
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {getBudgetHealth().length > 0 ? (
                          getBudgetHealth().map((budget) => (
                            <div key={budget.category} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(budget.category)}
                                  <span className="text-sm font-medium">{budget.category}</span>
                                </div>
                                <span className={`text-sm font-medium ${getStatusColor(budget.status)}`}>
                                  {formatCurrency(budget.spent)} / {formatCurrency(budget.budgeted)}
                                </span>
                              </div>
                              
                              {/* Custom progress bar */}
                              <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className={`absolute inset-y-0 left-0 transition-all duration-300 ${
                                    budget.status === 'overspending' ? 'bg-red-500' :
                                    budget.status === 'under_spending' ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min((budget.spent / budget.budgeted) * 100, 100)}%` }}
                                />
                              </div>
                              
                              {budget.status === 'overspending' && (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Overspent by {formatCurrency(Math.abs(budget.remaining))}
                                </p>
                              )}
                              {budget.status === 'under_spending' && (
                                <p className="text-xs text-yellow-600 flex items-center gap-1">
                                  <TrendingDown className="w-3 h-3" />
                                  Under budget by {formatCurrency(budget.remaining)}
                                </p>
                              )}
                              {budget.status === 'on_track' && (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  On track - {formatCurrency(budget.remaining)} remaining
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">No budget data available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="glass-panel p-4 text-center">
                        <p className="text-2xl font-bold text-accent">{getSavingsOpportunities().length}</p>
                        <p className="text-xs text-muted-foreground">Opportunities</p>
                      </div>
                      <div className="glass-panel p-4 text-center">
                        <p className="text-2xl font-bold text-red-500">{getAnomalies().length}</p>
                        <p className="text-xs text-muted-foreground">Anomalies</p>
                      </div>
                      <div className="glass-panel p-4 text-center">
                        <p className="text-2xl font-bold text-green-500">
                          {getBudgetHealth().filter(b => b.status === 'on_track').length}
                        </p>
                        <p className="text-xs text-muted-foreground">On Track</p>
                      </div>
                      <div className="glass-panel p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-500">
                          {getBudgetHealth().filter(b => b.status === 'overspending').length}
                        </p>
                        <p className="text-xs text-muted-foreground">Overspending</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Spending Tab - Added unique key */}
                {activeTab === "spending" && (
                  <motion.div
                    key="spending-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {getSpendingAnalysis().length > 0 ? (
                      getSpendingAnalysis().map((item, i) => (
                        <motion.div
                          key={item.category}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-background/50 rounded-xl p-4 border border-border/50 hover:border-accent/20 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(item.category)}
                              <h4 className="font-semibold">{item.category}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                              {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-green-500" />}
                              <Badge variant="outline" className={
                                item.trend === 'up' ? 'border-red-500/20 text-red-600' :
                                item.trend === 'down' ? 'border-green-500/20 text-green-600' :
                                'border-gray-500/20 text-gray-600'
                              }>
                                {item.percentageChange > 0 ? '+' : ''}{item.percentageChange}%
                              </Badge>
                            </div>
                          </div>
                          {item.recommendation && (
                            <p className="text-sm text-muted-foreground mt-2 pl-6">{item.recommendation}</p>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No spending analysis available</p>
                    )}
                  </motion.div>
                )}

                {/* Anomalies Tab - Added unique key */}
                {activeTab === "anomalies" && (
                  <motion.div
                    key="anomalies-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {getAnomalies().length > 0 ? (
                      getAnomalies().map((anomaly) => (
                        <motion.div
                          key={anomaly.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-red-500/5 rounded-xl p-4 border border-red-500/20 hover:border-red-500/40 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">{anomaly.description || 'Uncategorized transaction'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="border-red-500/20 text-xs">
                                    {anomaly.category || 'Uncategorized'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(anomaly.date)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="destructive" className="text-lg px-3 py-1">
                              {formatCurrency(anomaly.amount)}
                            </Badge>
                          </div>
                          <p className="text-sm text-red-600 mt-3 flex items-center gap-2 bg-red-500/10 p-2 rounded-lg">
                            <AlertTriangle className="w-4 h-4" />
                            {anomaly.reason}
                          </p>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                          <Shield className="w-10 h-10 text-green-500" />
                        </div>
                        <p className="text-lg font-medium text-foreground mb-2">No Anomalies Detected</p>
                        <p className="text-muted-foreground">Your transactions look normal and consistent!</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Opportunities Tab - Added unique key */}
                {activeTab === "opportunities" && (
                  <motion.div
                    key="opportunities-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {getSavingsOpportunities().length > 0 ? (
                      getSavingsOpportunities().map((opportunity, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-green-500/5 rounded-xl p-4 border border-green-500/20 hover:border-green-500/40 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                              <PiggyBank className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                <h4 className="font-semibold text-green-700 capitalize">
                                  {opportunity.type.replace('_', ' ')}
                                </h4>
                                <Badge className={getDifficultyColor(opportunity.difficulty)}>
                                  {opportunity.difficulty}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{opportunity.suggestion}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Potential savings</span>
                                <span className="text-xl font-bold text-green-600">
                                  {formatCurrency(opportunity.potentialSavings)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                          <DollarSign className="w-10 h-10 text-accent" />
                        </div>
                        <p className="text-lg font-medium text-foreground mb-2">No Opportunities Found</p>
                        <p className="text-muted-foreground">You're doing great! Check back later for new insights.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Tabs>

            {/* Financial Tips Section - Always visible */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                FINANCIAL TIPS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { 
                    icon: <Target className="w-5 h-5" />, 
                    title: "50/30/20 Rule", 
                    desc: "50% needs, 30% wants, 20% savings",
                    color: "text-blue-500"
                  },
                  { 
                    icon: <Shield className="w-5 h-5" />, 
                    title: "Emergency Fund", 
                    desc: "Aim for 6 months of expenses",
                    color: "text-green-500"
                  },
                  { 
                    icon: <TrendingUp className="w-5 h-5" />, 
                    title: "Invest Early", 
                    desc: "Compound interest is powerful",
                    color: "text-purple-500"
                  },
                ].map((tip, i) => (
                  <motion.div
                    key={tip.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="glass-panel p-4 space-y-2 hover:bg-background/80 transition-all hover:scale-105 cursor-pointer group"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-${tip.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <div className={tip.color}>{tip.icon}</div>
                    </div>
                    <h4 className="font-semibold text-sm text-foreground">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground">{tip.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        ) : (
          // Empty state
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-accent/50" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground mb-2">No Insights Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start by adding some transactions to get personalized AI-powered financial insights and recommendations.
            </p>
            <Button 
              onClick={() => window.location.href = '/transactions'} 
              className="mt-6 rounded-xl"
            >
              Add Transactions
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Insights;