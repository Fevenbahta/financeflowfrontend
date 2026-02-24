import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { budgetsApi, transactionsApi, accountsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Plus, PieChart, Sparkles, TrendingUp, TrendingDown, 
  AlertCircle, Award, Wallet, Calendar, ArrowRightLeft,
  Brain, Target, Bell, Shield, Zap, BarChart3,
  Clock, CheckCircle2, XCircle, HelpCircle, Lock,
  Gift, CreditCard, Home, ShoppingBag, Coffee, Car,
  Film, Briefcase, Code, PiggyBank, MoreHorizontal,
  Moon, Sun, Download, Upload, Repeat, ArrowLeftRight,
  LineChart, Settings, Share2, Star, Flag,
  Smile, Frown, Meh, ThumbsUp, ThumbsDown
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart as RPieChart, 
  Pie, 
  Cell, 
  Tooltip,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

// Enhanced Color Palette
const COLORS = {
  primary: {
    dark: "#1A1F2C",
    brown: "#6E3F25",
    beige: "#C9A87B",
    gold: "#C5904A",
    rose: "#C39D8A",
    olive: "#89836D",
    cream: "#F5E6D3",
    charcoal: "#2C3E50"
  },
  accent: {
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
    purple: "#8B5CF6",
    pink: "#EC4899"
  },
  gradients: {
    sunset: "linear-gradient(135deg, #C5904A 0%, #C39D8A 100%)",
    ocean: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
    forest: "linear-gradient(135deg, #10B981 0%, #6E3F25 100%)",
    rose: "linear-gradient(135deg, #EC4899 0%, #C39D8A 100%)"
  }
};

// Categories with enhanced metadata
// Categories with enhanced metadata
const CATEGORIES = [
  // Expense Categories (Essential)
  { 
    id: "rent", 
    name: "Rent", 
    icon: Home, 
    color: COLORS.primary.brown,
    lightColor: "#6E3F2520",
    avgPercentage: 30,
    essential: true,
    description: "Monthly housing payments",
    type: "expense"
  },
  { 
    id: "grocery", 
    name: "Grocery", 
    icon: ShoppingBag, 
    color: COLORS.primary.gold,
    lightColor: "#C5904A20",
    avgPercentage: 15,
    essential: true,
    description: "Food and household supplies",
    type: "expense"
  },
  { 
    id: "dining", 
    name: "Dining", 
    icon: Coffee, 
    color: COLORS.primary.rose,
    lightColor: "#C39D8A20",
    avgPercentage: 10,
    essential: false,
    description: "Restaurants and takeout",
    type: "expense"
  },
  { 
    id: "transport", 
    name: "Transport", 
    icon: Car, 
    color: COLORS.primary.olive,
    lightColor: "#89836D20",
    avgPercentage: 12,
    essential: true,
    description: "Gas, public transit, rideshare",
    type: "expense"
  },
  { 
    id: "entertainment", 
    name: "Entertainment", 
    icon: Film, 
    color: COLORS.primary.beige,
    lightColor: "#C9A87B20",
    avgPercentage: 8,
    essential: false,
    description: "Movies, games, subscriptions",
    type: "expense"
  },
  { 
    id: "utilities", 
    name: "Utilities", 
    icon: Zap, 
    color: COLORS.accent.warning,
    lightColor: "#F59E0B20",
    avgPercentage: 8,
    essential: true,
    description: "Electricity, water, internet",
    type: "expense"
  },
  { 
    id: "healthcare", 
    name: "Healthcare", 
    icon: Shield, 
    color: COLORS.accent.danger,
    lightColor: "#EF444420",
    avgPercentage: 10,
    essential: true,
    description: "Medical expenses, insurance",
    type: "expense"
  },
  { 
    id: "shopping", 
    name: "Shopping", 
    icon: ShoppingBag, 
    color: COLORS.primary.rose,
    lightColor: "#C39D8A20",
    avgPercentage: 5,
    essential: false,
    description: "Clothing, electronics, personal items",
    type: "expense"
  },
  { 
    id: "education", 
    name: "Education", 
    icon: MoreHorizontal, 
    color: COLORS.primary.charcoal,
    lightColor: "#2C3E5020",
    avgPercentage: 5,
    essential: true,
    description: "Tuition, courses, books",
    type: "expense"
  },
  { 
    id: "insurance", 
    name: "Insurance", 
    icon: Shield, 
    color: COLORS.primary.brown,
    lightColor: "#6E3F2520",
    avgPercentage: 5,
    essential: true,
    description: "Health, life, car insurance",
    type: "expense"
  },
  { 
    id: "subscriptions", 
    name: "Subscriptions", 
    icon: Film, 
    color: COLORS.primary.olive,
    lightColor: "#89836D20",
    avgPercentage: 3,
    essential: false,
    description: "Streaming, apps, memberships",
    type: "expense"
  },
  { 
    id: "fitness", 
    name: "Fitness", 
    icon: MoreHorizontal, 
    color: COLORS.accent.success,
    lightColor: "#10B98120",
    avgPercentage: 3,
    essential: false,
    description: "Gym, fitness classes, sports",
    type: "expense"
  },
  { 
    id: "pet", 
    name: "Pet Care", 
    icon: MoreHorizontal, 
    color: COLORS.accent.purple,
    lightColor: "#8B5CF620",
    avgPercentage: 2,
    essential: false,
    description: "Pet food, vet, supplies",
    type: "expense"
  },
  { 
    id: "gifts", 
    name: "Gifts", 
    icon: Gift, 
    color: COLORS.accent.pink,
    lightColor: "#EC489920",
    avgPercentage: 2,
    essential: false,
    description: "Birthday, holiday, special occasions",
    type: "expense"
  },

  // Income Categories
  { 
    id: "salary", 
    name: "Salary", 
    icon: Briefcase, 
    color: COLORS.accent.success,
    lightColor: "#10B98120",
    description: "Primary employment income",
    type: "income"
  },
  { 
    id: "freelance", 
    name: "Freelance", 
    icon: Code, 
    color: COLORS.accent.purple,
    lightColor: "#8B5CF620",
    description: "Contract work, gig economy",
    type: "income"
  },
  { 
    id: "investment", 
    name: "Investment", 
    icon: TrendingUp, 
    color: COLORS.accent.info,
    lightColor: "#3B82F620",
    description: "Dividends, capital gains, interest",
    type: "income"
  },
  { 
    id: "business", 
    name: "Business", 
    icon: Briefcase, 
    color: COLORS.accent.warning,
    lightColor: "#F59E0B20",
    description: "Business or side hustle income",
    type: "income"
  },
  { 
    id: "rental", 
    name: "Rental Income", 
    icon: Home, 
    color: COLORS.primary.brown,
    lightColor: "#6E3F2520",
    description: "Property rental income",
    type: "income"
  },
  { 
    id: "dividends", 
    name: "Dividends", 
    icon: TrendingUp, 
    color: COLORS.primary.gold,
    lightColor: "#C5904A20",
    description: "Stock dividends",
    type: "income"
  },
  { 
    id: "interest", 
    name: "Interest", 
    icon: TrendingUp, 
    color: COLORS.primary.olive,
    lightColor: "#89836D20",
    description: "Savings account interest",
    type: "income"
  },
  { 
    id: "bonus", 
    name: "Bonus", 
    icon: Award, 
    color: COLORS.accent.pink,
    lightColor: "#EC489920",
    description: "Work bonus, commissions",
    type: "income"
  },
  { 
    id: "gift", 
    name: "Gift", 
    icon: Gift, 
    color: COLORS.accent.warning,
    lightColor: "#F59E0B20",
    description: "Monetary gifts received",
    type: "income"
  },
  { 
    id: "refund", 
    name: "Refund", 
    icon: ArrowLeftRight, 
    color: COLORS.accent.info,
    lightColor: "#3B82F620",
    description: "Tax refunds, returns",
    type: "income"
  },
  { 
    id: "other-income", 
    name: "Other Income", 
    icon: MoreHorizontal, 
    color: COLORS.primary.charcoal,
    lightColor: "#2C3E5020",
    description: "Miscellaneous income",
    type: "income"
  },

  // Savings & Transfers
  { 
    id: "savings", 
    name: "Savings", 
    icon: PiggyBank, 
    color: COLORS.accent.pink,
    lightColor: "#EC489920",
    avgPercentage: 20,
    essential: true,
    description: "Money saved for future",
    type: "transfer"
  },
  { 
    id: "emergency-fund", 
    name: "Emergency Fund", 
    icon: Shield, 
    color: COLORS.accent.success,
    lightColor: "#10B98120",
    avgPercentage: 10,
    essential: true,
    description: "Emergency savings",
    type: "transfer"
  },
  { 
    id: "retirement", 
    name: "Retirement", 
    icon: PiggyBank, 
    color: COLORS.accent.purple,
    lightColor: "#8B5CF620",
    avgPercentage: 15,
    essential: true,
    description: "401k, IRA, pension",
    type: "transfer"
  },
  { 
    id: "investment-transfer", 
    name: "Investment Transfer", 
    icon: TrendingUp, 
    color: COLORS.accent.info,
    lightColor: "#3B82F620",
    description: "Transfer to investment accounts",
    type: "transfer"
  },

  // Other
  { 
    id: "other", 
    name: "Other", 
    icon: MoreHorizontal, 
    color: COLORS.primary.charcoal,
    lightColor: "#2C3E5020",
    description: "Miscellaneous transactions",
    type: "both"
  }
];

// Helper functions for filtering categories
const getCategoriesByType = (type: 'income' | 'expense' | 'transfer' | 'both') => {
  return CATEGORIES.filter(c => c.type === type || c.type === 'both');
};

// Get expense categories (for budget allocation)
const EXPENSE_CATEGORIES = CATEGORIES.filter(c => c.type === 'expense');

// Get income categories (for income transactions)
const INCOME_CATEGORIES = CATEGORIES.filter(c => c.type === 'income');

// Get transfer categories (for savings/transfers)
const TRANSFER_CATEGORIES = CATEGORIES.filter(c => c.type === 'transfer');

// For backward compatibility
const EXPENSE_ONLY_CATEGORIES = EXPENSE_CATEGORIES.map(c => c.name);
const INCOME_ONLY_CATEGORIES = INCOME_CATEGORIES.map(c => c.name);

// Types
interface Budget {
  id: string;
  category: string;
  percentage: number;
  amount?: number;
  recommended_percentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  description?: string;
  transactionDate: string;
  accountId: string;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
}

interface BudgetWithProgress extends Budget {
  budgetedAmount: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: 'on_track' | 'warning' | 'exceeded' | 'under_utilized';
  transactions: Transaction[];
  dailyAverage: number;
  projectedSpend: number;
  healthScore: number;
  // Add these properties to fix TypeScript errors
  icon?: React.ElementType;
  color?: string;
  description?: string;
}

interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  totalTransfers: number;
  netCashflow: number;
  startingBalance: number;
  endingBalance: number;
  savingsRate: number;
  expenseRatio: number;
}

interface AIInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'achievement' | 'suggestion' | 'tip' | 'alert';
  title: string;
  description: string;
  impact?: number;
  action?: {
    type: string;
    description: string;
    potentialSavings?: number;
    url?: string;
  };
  category?: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  read: boolean;
}

interface PurchaseCheck {
  advice?: string;
  canAfford: boolean;
  disposableIncome?: number;
  impact?: string;
  suggestions?: Array<{
    category: string;
    currentPercentage: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    reasoning: string;
    recommendedPercentage: number;
    suggestedAmount: number;
  }>;
}
// AI Assistant Component
const AIAssistant = ({ 
  insights, 
  onAction,
  onDismiss 
}: { 
  insights: AIInsight[]; 
  onAction: (insight: AIInsight) => void;
  onDismiss: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<AIInsight | null>(null);

  useEffect(() => {
    if (insights.length > 0 && !currentInsight) {
      setCurrentInsight(insights[0]);
    }
  }, [insights]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'achievement': return <Award className="w-5 h-5 text-yellow-500" />;
      case 'suggestion': return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'tip': return <Brain className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50';
      case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-4 border-blue-500 bg-blue-50';
      default: return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
        style={{ background: COLORS.gradients.sunset }}
      >
        <Brain className="w-6 h-6 text-white" />
        {insights.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {insights.length}
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border"
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ background: COLORS.gradients.sunset }}>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-white" />
          <span className="font-semibold text-white">AI Budget Assistant</span>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
          <XCircle className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="h-96 p-4">
        {currentInsight ? (
          <motion.div
            key={currentInsight.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-xl mb-3 ${getPriorityColor(currentInsight.priority)}`}
          >
            <div className="flex items-start gap-3">
              {getInsightIcon(currentInsight.type)}
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{currentInsight.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{currentInsight.description}</p>
                
                {currentInsight.impact && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="bg-white">
                      Impact: ${currentInsight.impact.toFixed(2)}
                    </Badge>
                  </div>
                )}
                
                {currentInsight.action && (
                  <div className="mt-3 flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onAction(currentInsight)}
                    >
                      {currentInsight.action.description}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onDismiss(currentInsight.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No new insights</p>
            <p className="text-sm">Check back later</p>
          </div>
        )}

        {/* Previous insights */}
        {insights.slice(1).map(insight => (
          <div key={insight.id} className="p-3 bg-gray-50 rounded-lg mb-2 text-sm opacity-75">
            <div className="flex items-center gap-2">
              {getInsightIcon(insight.type)}
              <span className="flex-1">{insight.title}</span>
              <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => onDismiss(insight.id)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          AI-powered insights based on your spending patterns
        </p>
      </div>
    </motion.div>
  );
};

// Smart Budget Card Component
const SmartBudgetCard = ({ 
  budget, 
  onAdjust,
  onViewDetails 
}: { 
  budget: BudgetWithProgress; 
  onAdjust: (id: string, newPercentage: number) => void;
  onViewDetails: (budget: BudgetWithProgress) => void;
}) => {
  const [showAdjust, setShowAdjust] = useState(false);
  const [tempPercentage, setTempPercentage] = useState(budget.percentage);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'exceeded': return '😰';
      case 'warning': return '😓';
      case 'on_track': return '😊';
      case 'under_utilized': return '😴';
      default: return '😐';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${budget.color}20` }}
          >
            {budget.icon && <budget.icon className="w-5 h-5" style={{ color: budget.color }} />}
          </div>
          <div>
            <h3 className="font-semibold">{budget.category}</h3>
            <p className="text-xs text-gray-500">{budget.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UITooltip>
            <TooltipTrigger>
              <div className={`text-2xl ${getHealthColor(budget.healthScore)}`}>
                {getStatusEmoji(budget.status)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Health Score: {budget.healthScore}%</p>
            </TooltipContent>
          </UITooltip>
          <Badge 
            className={
              budget.status === 'exceeded' ? 'bg-red-100 text-red-700' :
              budget.status === 'warning' ? 'bg-orange-100 text-orange-700' :
              budget.status === 'under_utilized' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }
          >
            {budget.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Amounts */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <p className="text-xs text-gray-500">Budgeted</p>
            <p className="font-bold">${budget.budgetedAmount.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Spent</p>
            <p className="font-bold text-orange-600">${budget.spent.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Left</p>
            <p className={`font-bold ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(budget.remaining).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">{budget.percentageUsed.toFixed(1)}% used</span>
            <span className="text-gray-500">
              {budget.dailyAverage > 0 ? `$${budget.dailyAverage.toFixed(2)}/day` : 'No spending'}
            </span>
          </div>
          <Progress 
            value={Math.min(budget.percentageUsed, 100)} 
            className={`h-2 ${
              budget.status === 'exceeded' ? 'bg-red-200' :
              budget.status === 'warning' ? 'bg-orange-200' :
              budget.status === 'under_utilized' ? 'bg-blue-200' :
              'bg-green-200'
            }`}
          />
        </div>

        {/* Projection */}
        {budget.projectedSpend > 0 && (
          <div className="text-xs p-2 rounded-lg bg-gray-50 mb-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Projected by month end:</span>
              <span className={budget.projectedSpend > budget.budgetedAmount ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                ${budget.projectedSpend.toLocaleString()}
                {budget.projectedSpend > budget.budgetedAmount && ' ⚠️'}
              </span>
            </div>
          </div>
        )}

        {/* Recent transactions */}
        {budget.transactions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Recent</p>
            {budget.transactions.slice(0, 2).map(tx => (
              <div key={tx.id} className="flex justify-between text-xs">
                <span className="truncate max-w-[150px]">{tx.description || tx.category}</span>
                <span className="font-medium">${tx.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-gray-50 flex gap-2">
        {!showAdjust ? (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowAdjust(true)}
            >
              Adjust
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onViewDetails(budget)}
            >
              Details
            </Button>
          </>
        ) : (
          <div className="flex-1 flex gap-2">
         <Slider 
  value={[tempPercentage]} 
  onValueChange={([v]) => {
    console.log('Slider value changed:', v, typeof v);
    setTempPercentage(v); // v should be a number
  }}
  min={0}
  max={100}
  step={0.5}
  className="flex-1"
/>


<Button 
  size="sm" 
  onClick={() => {
    console.log('Save clicked with tempPercentage:', tempPercentage, typeof tempPercentage);
    // Ensure we're passing a number
    onAdjust(budget.id, Number(tempPercentage));
    setShowAdjust(false);
  }}
>
  Save
</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdjust(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Purchase Checker Component
// Purchase Checker Component - Simplified version
const PurchaseChecker = ({ onCheck }: { onCheck: (data: any) => Promise<any> }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PurchaseCheck | null>(null);

  const handleCheck = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setLoading(true);
    try {
      console.log('Checking purchase amount:', Number(amount));
      
      const res = await onCheck({ amount: Number(amount) }); // Only send amount
      
      console.log('Purchase check response:', res);
      setResult(res);
    } catch (error) {
      console.error("Failed to check purchase:", error);
      toast.error("Failed to check purchase");
    }
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Calculate percentage of disposable income
  const getPercentageOfIncome = () => {
    if (!result || !result.disposableIncome) return null;
    return ((Number(amount) / result.disposableIncome) * 100).toFixed(1);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Smart Purchase Checker
        </CardTitle>
        <CardDescription>
          Check if you can afford a purchase based on your disposable income
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Enter amount to check"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <Button onClick={handleCheck} disabled={loading} className="min-w-[100px]">
            {loading ? 'Checking...' : 'Check'}
          </Button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4"
            >
              {/* Main result card */}
              <div className={`p-4 rounded-xl border ${
                result.canAfford 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {result.canAfford ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  
                  <div className="flex-1 space-y-3">
                    {/* Main advice */}
                    <div>
                      <h4 className={`font-semibold text-lg ${result.canAfford ? 'text-green-700' : 'text-red-700'}`}>
                        {result.canAfford ? '✓ You can afford this!' : '✗ Think twice about this purchase'}
                      </h4>
                      {result.advice && (
                        <p className="text-sm text-gray-600 mt-1">{result.advice}</p>
                      )}
                    </div>

                    {/* Financial metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      {result.disposableIncome && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <Wallet className="w-3 h-3" />
                            Disposable Income
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            ${result.disposableIncome.toLocaleString()}
                          </p>
                        </div>
                      )}
                      
                      {Number(amount) > 0 && result.disposableIncome && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            % of Income
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            {getPercentageOfIncome()}%
                          </p>
                          {result.impact && (
                            <p className="text-xs text-gray-500 mt-1">{result.impact}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* AI Suggestions */}
                    {result.suggestions && result.suggestions.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                          <Brain className="w-4 h-4" />
                          AI Insights to Improve Your Finances
                        </p>
                        <div className="space-y-2">
                          {result.suggestions.map((suggestion, index) => (
                            <div 
                              key={index}
                              className={`p-3 rounded-lg border ${getPriorityColor(suggestion.priority)}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="font-semibold text-sm">{suggestion.category}</span>
                                    <Badge variant="outline" className={`text-xs ${
                                      suggestion.priority === 'HIGH' ? 'border-red-200 text-red-700' :
                                      suggestion.priority === 'MEDIUM' ? 'border-yellow-200 text-yellow-700' :
                                      'border-green-200 text-green-700'
                                    }`}>
                                      {suggestion.priority} Priority
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-sm text-gray-700 mb-2">
                                    {suggestion.reasoning}
                                  </p>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-sm bg-white/50 p-2 rounded">
                                    <div>
                                      <span className="text-gray-500">Current allocation:</span>
                                      <span className="ml-1 font-medium">
                                        {suggestion.currentPercentage}%
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Recommended:</span>
                                      <span className="ml-1 font-medium text-green-600">
                                        {suggestion.recommendedPercentage}%
                                      </span>
                                    </div>
                                    {suggestion.suggestedAmount > 0 && (
                                      <div className="col-span-2">
                                        <span className="text-gray-500">Suggested monthly amount:</span>
                                        <span className="ml-1 font-medium">
                                          ${suggestion.suggestedAmount.toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick tip */}
              <div className="mt-3 text-xs text-gray-500 flex items-center gap-1 justify-center">
                <Sparkles className="w-3 h-3" />
                <span>Based on your monthly disposable income of ${result.disposableIncome?.toLocaleString()}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
// Main Budgets Component
const Budgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "Rent", percentage: "" });
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<BudgetWithProgress | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPurchaseChecker, setShowPurchaseChecker] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [budgetsData, transactionsData, accountsData] = await Promise.all([
        budgetsApi.getAll(),
        transactionsApi.getAll(),
        accountsApi.getAll()
      ]);

      setBudgets(budgetsData);
      setTransactions(transactionsData);
      setAccounts(accountsData);

      calculateMonthlyData(transactionsData, accountsData);
      generateInsights(budgetsData, transactionsData, accountsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate monthly data
  const calculateMonthlyData = (
    allTransactions: Transaction[],
    allAccounts: Account[]
  ) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    
    const monthTransactions = allTransactions.filter(t => {
      const date = new Date(t.transactionDate);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalTransfers = monthTransactions
      .filter(t => t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0);

    // Get starting balance
    const previousMonthDate = new Date(year, month - 2);
    const previousMonthTransactions = allTransactions.filter(t => {
      const date = new Date(t.transactionDate);
      return date < previousMonthDate;
    });

    const previousMonthBalance = allAccounts.reduce((sum, account) => {
      const accountTransactions = previousMonthTransactions.filter(t => t.accountId === account.id);
      const accountBalance = accountTransactions.reduce((acc, t) => {
        if (t.type === 'income') return acc + t.amount;
        if (t.type === 'expense') return acc - t.amount;
        return acc;
      }, 0);
      return sum + accountBalance;
    }, 0);

    const endingBalance = previousMonthBalance + totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    setMonthlyIncome(totalIncome);
    setMonthlySummary({
      totalIncome,
      totalExpenses,
      totalTransfers,
      netCashflow: totalIncome - totalExpenses,
      startingBalance: previousMonthBalance,
      endingBalance,
      savingsRate,
      expenseRatio: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0
    });
  };

  // Generate AI insights
  const generateInsights = async (
    budgets: Budget[],
    transactions: Transaction[],
    accounts: Account[]
  ) => {
    const newInsights: AIInsight[] = [];
    const [year, month] = selectedMonth.split('-').map(Number);
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.transactionDate);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });

    // Calculate category spending
    const categorySpending = new Map<string, number>();
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categorySpending.get(t.category) || 0;
        categorySpending.set(t.category, current + t.amount);
      });

    // Check for overspending
    budgets.forEach(budget => {
      const spent = categorySpending.get(budget.category) || 0;
      const budgetedAmount = (budget.percentage / 100) * monthlyIncome;
      const percentageUsed = budgetedAmount > 0 ? (spent / budgetedAmount) * 100 : 0;

      if (percentageUsed > 100) {
        newInsights.push({
          id: `overspend-${budget.category}-${Date.now()}`,
          type: 'warning',
          title: `Overspent in ${budget.category}`,
          description: `You've exceeded your ${budget.category} budget by $${(spent - budgetedAmount).toFixed(2)}.`,
          impact: spent - budgetedAmount,
          category: budget.category,
          priority: 'high',
          timestamp: new Date(),
          read: false,
        
        });
      } else if (percentageUsed > 85) {
        newInsights.push({
          id: `warning-${budget.category}-${Date.now()}`,
          type: 'warning',
          title: `Near limit in ${budget.category}`,
          description: `You've used ${percentageUsed.toFixed(1)}% of your ${budget.category} budget.`,
          category: budget.category,
          priority: 'medium',
          timestamp: new Date(),
          read: false,
          action: {
            type: 'reduce',
            description: 'Reduce spending',
            potentialSavings: spent * 0.1
          }
        });
      } else if (percentageUsed < 30 && budgetedAmount > 100) {
        newInsights.push({
          id: `underutilized-${budget.category}-${Date.now()}`,
          type: 'opportunity',
          title: `Under budget in ${budget.category}`,
          description: `You've only used ${percentageUsed.toFixed(1)}% of your ${budget.category} budget.`,
          impact: budgetedAmount - spent,
          category: budget.category,
          priority: 'low',
          timestamp: new Date(),
          read: false,
          action: {
            type: 'reallocate',
            description: 'Reallocate to savings',
            potentialSavings: (budgetedAmount - spent) * 0.5
          }
        });
      }
    });

    // Check savings rate
    if (monthlySummary) {
      if (monthlySummary.savingsRate < 10) {
        newInsights.push({
          id: `low-savings-${Date.now()}`,
          type: 'warning',
          title: 'Low savings rate',
          description: `Your savings rate is only ${monthlySummary.savingsRate.toFixed(1)}%. Aim for at least 20%.`,
          impact: monthlyIncome * 0.2 - (monthlyIncome - monthlySummary.totalExpenses),
          priority: 'high',
          timestamp: new Date(),
          read: false,
          action: {
            type: 'increase',
            description: 'Increase savings',
            potentialSavings: monthlyIncome * 0.1
          }
        });
      } else if (monthlySummary.savingsRate > 30) {
        newInsights.push({
          id: `high-savings-${Date.now()}`,
          type: 'achievement',
          title: 'Great savings rate!',
          description: `You're saving ${monthlySummary.savingsRate.toFixed(1)}% of your income. Excellent work!`,
          impact: monthlySummary.totalIncome - monthlySummary.totalExpenses,
          priority: 'low',
          timestamp: new Date(),
          read: false
        });
      }
    }

    // Check for unusual spending patterns
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyAverage = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) / daysInMonth;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdaySpending = monthTransactions
      .filter(t => {
        const date = new Date(t.transactionDate);
        return date.toDateString() === yesterday.toDateString() && t.type === 'expense';
      })
      .reduce((sum, t) => sum + t.amount, 0);

    if (yesterdaySpending > dailyAverage * 2) {
      newInsights.push({
        id: `unusual-spending-${Date.now()}`,
        type: 'alert',
        title: 'Unusual spending detected',
        description: `You spent $${yesterdaySpending.toFixed(2)} yesterday, which is ${((yesterdaySpending / dailyAverage) * 100).toFixed(0)}% above your daily average.`,
        impact: yesterdaySpending - dailyAverage,
        priority: 'medium',
        timestamp: new Date(),
        read: false
      });
    }

    // Sort by priority
    newInsights.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    });

    setInsights(newInsights);
  };

  // Calculate budget progress
  const calculateBudgetProgress = (): BudgetWithProgress[] => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const currentDay = Math.min(new Date().getDate(), daysInMonth);
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.transactionDate);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });

    const expensesByCategory = new Map<string, Transaction[]>();
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!expensesByCategory.has(t.category)) {
          expensesByCategory.set(t.category, []);
        }
        expensesByCategory.get(t.category)!.push(t);
      });

    return budgets.map(budget => {
      const budgetedAmount = (budget.percentage / 100) * monthlyIncome;
      const categoryTransactions = expensesByCategory.get(budget.category) || [];
      const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const remaining = budgetedAmount - spent;
      const percentageUsed = budgetedAmount > 0 ? (spent / budgetedAmount) * 100 : 0;
      
      let status: 'on_track' | 'warning' | 'exceeded' | 'under_utilized' = 'on_track';
      if (percentageUsed > 100) status = 'exceeded';
      else if (percentageUsed > 85) status = 'warning';
      else if (percentageUsed < 30 && budgetedAmount > 100) status = 'under_utilized';

      const dailyAverage = currentDay > 0 ? spent / currentDay : 0;
      const projectedSpend = dailyAverage * daysInMonth;
      
      // Calculate health score
      let healthScore = 100;
      if (percentageUsed > 100) healthScore = 50 - (percentageUsed - 100);
      else if (percentageUsed > 85) healthScore = 70 - (percentageUsed - 85) * 2;
      else if (percentageUsed > 50) healthScore = 90;
      else healthScore = 80 + (50 - percentageUsed) * 0.5;
      
      healthScore = Math.max(0, Math.min(100, healthScore));

      // Find category info
      const categoryInfo = CATEGORIES.find(c => c.name === budget.category) || CATEGORIES[CATEGORIES.length - 1];

      return {
        ...budget,
        budgetedAmount,
        spent,
        remaining,
        percentageUsed,
        status,
        transactions: categoryTransactions,
        dailyAverage,
        projectedSpend,
        healthScore,
        // Add these properties from categoryInfo
        icon: categoryInfo.icon,
        color: categoryInfo.color,
        description: categoryInfo.description || ''
      };
    });
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create budget data without recommended_percentage
      const budgetData = {
        category: form.category,
        percentage: Number(form.percentage)
      };

      await budgetsApi.create(budgetData);
      toast.success("Budget allocation added!");
      setShowForm(false);
      setForm({ category: "Rent", percentage: "" });
      loadData();
    } catch (err: any) { 
      toast.error(err.message); 
    }
  };

const handleAdjustBudget = async (id: string, newPercentage: any) => {
  console.log('RAW INPUT:', { id, newPercentage, type: typeof newPercentage });
  console.log('JSON stringified:', JSON.stringify(newPercentage));
  
  // If it's an object with percentage property, extract it
  let percentageValue: number;
  
  if (typeof newPercentage === 'object' && newPercentage !== null) {
    console.log('Received object:', newPercentage);
    if ('percentage' in newPercentage) {
      percentageValue = Number(newPercentage.percentage);
      console.log('Extracted percentage from object:', percentageValue);
    } else {
      toast.error("Invalid data format");
      return;
    }
  } else {
    percentageValue = Number(newPercentage);
  }
  
  if (isNaN(percentageValue)) {
    toast.error("Invalid percentage value");
    return;
  }
  
  try {
    const existingBudget = budgets.find(b => b.id === id);
    if (!existingBudget) {
      toast.error("Budget not found");
      return;
    }
    
    if (existingBudget.percentage === percentageValue) {
      toast.info("Percentage unchanged");
      return;
    }
    
    await budgetsApi.update(id, percentageValue);
    toast.success("Budget updated successfully!");
    loadData();
  } catch (err: any) {
    console.error("Error adjusting budget:", err);
    toast.error(err.message || "Failed to update budget");
    loadData();
  }
};
  const handleDeleteBudget = async (id: string) => {
    try {
      await budgetsApi.delete(id);
      toast.success("Budget deleted");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

const handlePurchaseCheck = async (data: { amount: number }) => {
  try {
    console.log('🔍 Checking purchase with amount:', data.amount);
    const response = await budgetsApi.checkPurchase(data);
    console.log('📥 Purchase check response:', response);
    return response;
  } catch (error) {
    console.error('❌ Purchase check error:', error);
    throw error;
  }
};

  const handleInsightAction = (insight: AIInsight) => {
    toast.success(`Action: ${insight.action?.description}`);
    // Mark as read
    setInsights(prev => prev.filter(i => i.id !== insight.id));
  };

  const handleDismissInsight = (id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const budgetProgress = calculateBudgetProgress();
  const totalPct = budgets.reduce((s, b) => s + (b.percentage || 0), 0);
  
  const pieData = budgets.map((b) => ({ 
    name: b.category, 
    value: b.percentage,
    amount: (b.percentage / 100) * monthlyIncome
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-red-600 bg-red-100 border-red-200';
      case 'warning': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'under_utilized': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-green-600 bg-green-100 border-green-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <div className="space-y-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent">
            Smart Budget Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            AI-powered insights to optimize your spending
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Month selector */}
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border-0 focus:ring-0 text-sm"
            />
          </div>

          {/* View toggle */}
          <div className="flex bg-white rounded-xl border p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-lg"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-lg"
            >
              List
            </Button>
          </div>

          {/* Dark mode toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Add budget button */}
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-amber-500 to-rose-500 text-white">
            <Plus className="w-4 h-4 mr-2" /> New Budget
          </Button>

          {/* Purchase checker toggle */}
          <Button
            variant="outline"
            onClick={() => setShowPurchaseChecker(!showPurchaseChecker)}
          >
            <Zap className="w-4 h-4 mr-2" /> Check Purchase
          </Button>
        </div>
      </div>

      {/* Purchase checker */}
      <AnimatePresence>
{showPurchaseChecker && (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <PurchaseChecker onCheck={handlePurchaseCheck} />
  </motion.div>
)}
      </AnimatePresence>

      {/* Add budget form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleCreateBudget}
            className="bg-white p-6 rounded-xl shadow-lg border mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Category</Label>
            {/* In the add budget form */}
<Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {EXPENSE_CATEGORIES.map((c) => {
      const Icon = c.icon;
      return (
        <SelectItem key={c.id} value={c.name}>
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" style={{ color: c.color }} />
            {c.name}
            {c.essential && <Badge variant="outline" className="text-xs ml-2">Essential</Badge>}
          </div>
        </SelectItem>
      );
    })}
  </SelectContent>
</Select>
              </div>
              
              <div>
                <Label>Percentage (%)</Label>
                <Input 
                  type="number" 
                  value={form.percentage} 
                  onChange={(e) => setForm({ ...form, percentage: e.target.value })} 
                  required 
                  min="0"
                  max="100"
                  step="0.1"
                />
                {monthlyIncome > 0 && form.percentage && (
                  <p className="text-xs text-gray-500 mt-1">
                    Amount: ${((Number(form.percentage) / 100) * monthlyIncome).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex items-end gap-2">
                <Button type="submit" className="flex-1">
                  Save Budget
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      {monthlySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Monthly Income</p>
                  <p className="text-2xl font-bold text-green-700">
                    +${monthlySummary.totalIncome.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Monthly Expenses</p>
                  <p className="text-2xl font-bold text-red-700">
                    -${monthlySummary.totalExpenses.toLocaleString()}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${
            monthlySummary.netCashflow >= 0 ? 'from-blue-50 to-white border-blue-200' : 'from-orange-50 to-white border-orange-200'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Net Cashflow</p>
                  <p className={`text-2xl font-bold ${monthlySummary.netCashflow >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    ${monthlySummary.netCashflow.toLocaleString()}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Savings Rate</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {monthlySummary.savingsRate.toFixed(1)}%
                  </p>
                </div>
                <PiggyBank className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
              <Progress 
                value={monthlySummary.savingsRate} 
                className="h-1 mt-2"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Budget progress cards */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgetProgress.map((budget, i) => (
                <SmartBudgetCard
                  key={budget.id}
                  budget={budget}
                  onAdjust={handleAdjustBudget}
                  onViewDetails={setSelectedBudget}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {budgetProgress.map((budget, i) => (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-4 rounded-xl border flex items-center gap-4"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${budget.color}20` }}
                  >
                    {budget.icon && <budget.icon className="w-5 h-5" style={{ color: budget.color }} />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{budget.category}</h3>
                      <Badge className={getStatusColor(budget.status)}>
                        {budget.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Budget</p>
                        <p className="font-medium">${budget.budgetedAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Spent</p>
                        <p className="font-medium text-orange-600">${budget.spent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Left</p>
                        <p className={`font-medium ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(budget.remaining).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Health</p>
                        <p className={`font-medium ${budget.healthScore >= 80 ? 'text-green-600' : budget.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {budget.healthScore}%
                        </p>
                      </div>
                    </div>
                    
                    <Progress 
                      value={Math.min(budget.percentageUsed, 100)} 
                      className={`h-1.5 mt-2 ${
                        budget.status === 'exceeded' ? 'bg-red-200' :
                        budget.status === 'warning' ? 'bg-orange-200' :
                        budget.status === 'under_utilized' ? 'bg-blue-200' :
                        'bg-green-200'
                      }`}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleAdjustBudget(budget.id, budget.percentage)}
                    >
                      Adjust
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-red-600"
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="budgets">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Allocation chart */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Allocation</CardTitle>
                <CardDescription>How your income is distributed</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 && monthlyIncome > 0 ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <RPieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={Object.values(COLORS.primary)[i % Object.values(COLORS.primary).length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RPieChart>
                    </ResponsiveContainer>
                    
                    <div className="space-y-2">
                      {pieData.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full" 
                              style={{ background: Object.values(COLORS.primary)[i % Object.values(COLORS.primary).length] }} 
                            />
                            <span>{item.name}</span>
                          </div>
                          <div className="flex gap-4">
                            <span className="text-gray-500">${item.amount.toLocaleString()}</span>
                            <span className="font-medium w-12 text-right">{item.value}%</span>
                          </div>
                        </div>
                      ))}
                      
                      <Separator />
                      
                      <div className="flex justify-between font-medium pt-2">
                        <span>Total</span>
                        <div className="flex gap-4">
                          <span>${monthlyIncome.toLocaleString()}</span>
                          <span className="w-12 text-right">{totalPct}%</span>
                        </div>
                      </div>
                      
                      {totalPct !== 100 && (
                        <div className="flex justify-between text-sm text-orange-600">
                          <span>Unallocated</span>
                          <div className="flex gap-4">
                            <span>${((100 - totalPct) / 100 * monthlyIncome).toLocaleString()}</span>
                            <span className="w-12 text-right">{100 - totalPct}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">No budgets allocated</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Smart Recommendations
                </CardTitle>
                <CardDescription>
                  Based on 50/30/20 rule and your spending patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {CATEGORIES.filter(c => c.avgPercentage).map((category, i) => {
                    const currentBudget = budgets.find(b => b.category === category.name);
                    const currentPct = currentBudget?.percentage || 0;
                    const diff = category.avgPercentage ? currentPct - category.avgPercentage : 0;
                    
                    return (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <category.icon className="w-4 h-4" style={{ color: category.color }} />
                          <span className="text-sm">{category.name}</span>
                          {category.essential && (
                            <Badge variant="outline" className="text-xs">Essential</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-sm">
                            {currentPct}% / {category.avgPercentage}%
                          </span>
                          
                          {diff !== 0 && (
                            <Badge className={diff > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                            </Badge>
                          )}
                          
                          {!currentBudget && (
                            <Button size="sm" variant="outline" onClick={() => {
                              setForm({ category: category.name, percentage: category.avgPercentage?.toString() || '' });
                              setShowForm(true);
                            }}>
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <p className="text-xs text-gray-500">
                  *Based on the 50/30/20 rule: 50% needs, 30% wants, 20% savings
                </p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending trend */}
            <Card>
              <CardHeader>
                <CardTitle>Spending Trend</CardTitle>
                <CardDescription>Daily spending pattern</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={budgetProgress.map(b => ({
                    name: b.category,
                    spent: b.spent,
                    budgeted: b.budgetedAmount
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="budgeted" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="spent" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual</CardTitle>
                <CardDescription>Compare planned vs actual spending</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="budgetedAmount" fill="#8884d8" name="Budgeted" />
                    <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Health scores */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Budget Health Scores</CardTitle>
                <CardDescription>How healthy each category is</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetProgress.map((budget, i) => (
                    <div key={budget.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{budget.category}</span>
                        <span className={budget.healthScore >= 80 ? 'text-green-600' : budget.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                          {budget.healthScore}%
                        </span>
                      </div>
                      <Progress 
                        value={budget.healthScore} 
                        className={`h-2 ${
                          budget.healthScore >= 80 ? 'bg-green-200' :
                          budget.healthScore >= 60 ? 'bg-yellow-200' :
                          'bg-red-200'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid gap-4">
            {insights.map((insight, i) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Alert className={`border-l-4 ${
                  insight.type === 'warning' ? 'border-l-red-500' :
                  insight.type === 'opportunity' ? 'border-l-green-500' :
                  insight.type === 'achievement' ? 'border-l-yellow-500' :
                  'border-l-blue-500'
                }`}>
                  <div className="flex items-start gap-3">
                    {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    {insight.type === 'opportunity' && <TrendingUp className="w-5 h-5 text-green-500" />}
                    {insight.type === 'achievement' && <Award className="w-5 h-5 text-yellow-500" />}
                    {insight.type === 'suggestion' && <Sparkles className="w-5 h-5 text-purple-500" />}
                    {insight.type === 'tip' && <Brain className="w-5 h-5 text-blue-500" />}
                    
                    <div className="flex-1">
                      <AlertTitle>{insight.title}</AlertTitle>
                      <AlertDescription>{insight.description}</AlertDescription>
                      
                      {insight.action && (
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" onClick={() => handleInsightAction(insight)}>
                            {insight.action.description}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDismissInsight(insight.id)}>
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <Badge className={
                      insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                      insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {insight.priority}
                    </Badge>
                  </div>
                </Alert>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Assistant */}
      <AIAssistant 
        insights={insights}
        onAction={handleInsightAction}
        onDismiss={handleDismissInsight}
      />

      {/* Budget details modal */}
      <AnimatePresence>
        {selectedBudget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedBudget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{selectedBudget.category} Details</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedBudget(null)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Budgeted</p>
                  <p className="text-xl font-bold">${selectedBudget.budgetedAmount.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Spent</p>
                  <p className="text-xl font-bold text-orange-600">${selectedBudget.spent.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p className={`text-xl font-bold ${selectedBudget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(selectedBudget.remaining).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Progress</span>
                  <span className="text-sm font-medium">{selectedBudget.percentageUsed.toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(selectedBudget.percentageUsed, 100)} className="h-2" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Daily Average</p>
                  <p className="text-lg font-semibold">${selectedBudget.dailyAverage.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Projected</p>
                  <p className={`text-lg font-semibold ${selectedBudget.projectedSpend > selectedBudget.budgetedAmount ? 'text-red-600' : 'text-green-600'}`}>
                    ${selectedBudget.projectedSpend.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Transactions */}
              <h3 className="font-semibold mb-3">Transactions</h3>
              <div className="space-y-2">
                {selectedBudget.transactions.length > 0 ? (
                  selectedBudget.transactions.map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{tx.description || tx.category}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.transactionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-semibold">${tx.amount.toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No transactions in this category</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Budgets;