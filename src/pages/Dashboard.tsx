import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { accountsApi, transactionsApi, goalsApi, aiApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#C5904A", "#6E3F25", "#C9A87B", "#C39D8A", "#89836D"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Dashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      accountsApi.getAll(),
      transactionsApi.getAll(),
      goalsApi.getAll(),
      aiApi.analyze(),
    ]).then(([acc, tx, gl, ai]) => {
      if (acc.status === "fulfilled") setAccounts(acc.value);
      if (tx.status === "fulfilled") setTransactions(tx.value);
      if (gl.status === "fulfilled") setGoals(gl.value);
      if (ai.status === "fulfilled") setInsight(ai.value.insight);
      setLoading(false);
    });
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // Group expenses by category for pie chart
  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryMap[t.category || "Other"] = (categoryMap[t.category || "Other"] || 0) + t.amount;
    });
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Simple area chart data from recent transactions
  const chartData = transactions.slice(0, 12).reverse().map((t, i) => ({
    name: `${i + 1}`,
    amount: t.amount,
    type: t.type,
  }));

  const healthScore = Math.min(100, Math.max(0, Math.round(
    (income > 0 ? ((income - expenses) / income) * 100 : 50)
  )));

  const stats = [
    { label: "Total Balance", value: totalBalance.toLocaleString(), icon: Wallet, trend: "up" as const },
    { label: "Income", value: income.toLocaleString(), icon: TrendingUp, trend: "up" as const },
    { label: "Expenses", value: expenses.toLocaleString(), icon: TrendingDown, trend: "down" as const },
    { label: "Active Goals", value: goals.length.toString(), icon: Target, trend: "up" as const },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
          Welcome back, {user?.username} 👋
        </h1>
        <p className="text-muted-foreground font-body">
          Here's your financial overview.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="glass-card p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-accent" />
              </div>
              {stat.trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-accent" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-destructive" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-body">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">Transaction Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData.length ? chartData : [{ name: "1", amount: 0 }]}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C5904A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C5904A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(33, 20%, 85%)" />
              <XAxis dataKey="name" stroke="hsl(44, 12%, 48%)" fontSize={12} />
              <YAxis stroke="hsl(44, 12%, 48%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(33, 30%, 96%)",
                  border: "1px solid hsl(33, 20%, 85%)",
                  borderRadius: "12px",
                  fontSize: "13px",
                }}
              />
              <Area type="monotone" dataKey="amount" stroke="#C5904A" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart / Health */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 flex flex-col items-center"
        >
          <h3 className="text-lg font-display font-semibold text-foreground mb-4 self-start">Financial Health</h3>
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(33, 20%, 90%)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="40" fill="none"
                stroke="#C5904A" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${healthScore * 2.51} 251`}
                initial={{ strokeDasharray: "0 251" }}
                animate={{ strokeDasharray: `${healthScore * 2.51} 251` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{healthScore}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">Score out of 100</p>

          {pieData.length > 0 && (
            <div className="mt-4 w-full">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={50} innerRadius={30}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Insight */}
      {insight && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 border-l-4 border-accent"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-1">AI Insight</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Goals Preview */}
      {goals.length > 0 && (
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">Your Goals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.slice(0, 3).map((goal, i) => {
              const pct = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0;
              return (
                <motion.div
                  key={goal.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="glass-card p-5 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-foreground font-body">{goal.title}</h4>
                    <span className="text-xs font-medium text-accent">{pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full gradient-gold rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {goal.current_amount?.toLocaleString()} / {goal.target_amount?.toLocaleString()}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
