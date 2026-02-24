import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { transactionsApi, accountsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Plus, Trash2, ArrowUpRight, ArrowDownRight, 
  Calendar, ChevronDown, ChevronUp, Eye,
  Home, ShoppingBag, Coffee, Car, Film,
  Briefcase, Code, TrendingUp, PiggyBank, MoreHorizontal,
  CreditCard, Wallet, CalendarDays
} from "lucide-react";

// Elegant Color Palette
const COLORS = {
  primaryDark: "#6E3F25",      // Deep Brown
  secondaryBeige: "#C9A87B",    // Soft Beige
  accentWarmGold: "#C5904A",    // Warm Gold
  softAccent: "#C39D8A",        // Dusty Rose
  neutralOlive: "#89836D",      // Olive Grey
};

/////////////////////
// Backend Types
/////////////////////
interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  userId: string;
}

interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category?: string;
  description?: string;
  transactionDate: string;
}

// Categories with Icons & Colors
const CATEGORIES = [
  // Expense Categories
  { name: "Rent", icon: Home, color: COLORS.primaryDark, type: "expense" },
  { name: "Grocery", icon: ShoppingBag, color: COLORS.accentWarmGold, type: "expense" },
  { name: "Dining", icon: Coffee, color: COLORS.softAccent, type: "expense" },
  { name: "Transport", icon: Car, color: COLORS.neutralOlive, type: "expense" },
  { name: "Entertainment", icon: Film, color: COLORS.secondaryBeige, type: "expense" },
  { name: "Utilities", icon: Home, color: COLORS.primaryDark, type: "expense" },
  { name: "Shopping", icon: ShoppingBag, color: COLORS.accentWarmGold, type: "expense" },
  { name: "Healthcare", icon: MoreHorizontal, color: COLORS.softAccent, type: "expense" },
  { name: "Education", icon: MoreHorizontal, color: COLORS.neutralOlive, type: "expense" },
  
  // Income Categories
  { name: "Salary", icon: Briefcase, color: COLORS.accentWarmGold, type: "income" },
  { name: "Freelance", icon: Code, color: COLORS.primaryDark, type: "income" },
  { name: "Investment", icon: TrendingUp, color: COLORS.neutralOlive, type: "income" },
  { name: "Savings", icon: PiggyBank, color: COLORS.softAccent, type: "income" },
  { name: "Business", icon: Briefcase, color: COLORS.accentWarmGold, type: "income" },
  { name: "Rental Income", icon: Home, color: COLORS.primaryDark, type: "income" },
  { name: "Dividends", icon: TrendingUp, color: COLORS.neutralOlive, type: "income" },
  { name: "Gift", icon: MoreHorizontal, color: COLORS.softAccent, type: "income" },
  
  // Other
  { name: "Other", icon: MoreHorizontal, color: COLORS.secondaryBeige, type: "both" },
];

// Helper to get categories by type
const getCategoriesByType = (type: "income" | "expense" | "both") => {
  return CATEGORIES.filter(c => c.type === type || c.type === "both");
};

// Expense-only categories for validation
const EXPENSE_ONLY_CATEGORIES = CATEGORIES
  .filter(c => c.type === "expense")
  .map(c => c.name);

// Income-only categories for validation  
const INCOME_ONLY_CATEGORIES = CATEGORIES
  .filter(c => c.type === "income")
  .map(c => c.name);
/////////////////////
// Account Modal
/////////////////////
interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (account: Account) => void;
}

const AccountModal = ({ isOpen, onClose, onCreated }: AccountModalProps) => {
  const [form, setForm] = useState({
    name: "",
    type: "Checking",
    balance: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return toast.error("Account name is required");

    setLoading(true);
    try {
      const account = await accountsApi.create(form);
      toast.success("Account created!");
      onCreated(account);
      setForm({ name: "", type: "Checking", balance: 0 });
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.primaryDark }}>Create New Account</h2>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div>
            <Label style={{ color: COLORS.neutralOlive }}>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{ borderColor: COLORS.secondaryBeige }}
              className="focus:ring-2 focus:ring-opacity-50"
              onFocus={(e) => e.target.style.borderColor = COLORS.accentWarmGold}
              onBlur={(e) => e.target.style.borderColor = COLORS.secondaryBeige}
            />
          </div>

          <div>
            <Label style={{ color: COLORS.neutralOlive }}>Type</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v })}
            >
              <SelectTrigger style={{ borderColor: COLORS.secondaryBeige }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Checking">Checking</SelectItem>
                <SelectItem value="Savings">Savings</SelectItem>
                <SelectItem value="Investment">Investment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label style={{ color: COLORS.neutralOlive }}>Initial Balance</Label>
            <Input
              type="number"
              value={form.balance}
              onChange={(e) =>
                setForm({ ...form, balance: Number(e.target.value) })
              }
              style={{ borderColor: COLORS.secondaryBeige }}
              className="focus:ring-2 focus:ring-opacity-50"
              onFocus={(e) => e.target.style.borderColor = COLORS.accentWarmGold}
              onBlur={(e) => e.target.style.borderColor = COLORS.secondaryBeige}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} style={{ color: COLORS.neutralOlive }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              style={{ backgroundColor: COLORS.primaryDark }}
              className="hover:opacity-90 text-white"
            >
              {loading ? "Saving..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/////////////////////
// Month Section Component
/////////////////////
interface MonthSectionProps {
  month: string;
  transactions: Transaction[];
  accounts: Account[];
  isCurrentMonth: boolean;
  onDelete: (id: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const MonthSection = ({ 
  month, 
  transactions, 
  accounts,
  isCurrentMonth,
  onDelete,
  isExpanded,
  onToggle
}: MonthSectionProps) => {
  const navigate = useNavigate();
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <motion.div 
      className="overflow-hidden rounded-xl shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ 
        backgroundColor: 'white',
        border: isCurrentMonth ? `2px solid ${COLORS.accentWarmGold}` : `1px solid ${COLORS.secondaryBeige}`,
      }}
    >
      {/* Month Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer transition-colors"
        onClick={onToggle}
        style={{ backgroundColor: isCurrentMonth ? `${COLORS.secondaryBeige}20` : 'transparent' }}
      >
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5" style={{ color: COLORS.primaryDark }} />
          <h2 className="text-lg font-semibold" style={{ color: COLORS.primaryDark }}>
            {month}
            {isCurrentMonth && (
              <span className="ml-2 text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: COLORS.accentWarmGold }}>
                Current
              </span>
            )}
          </h2>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="font-medium" style={{ color: COLORS.accentWarmGold }}>+${totalIncome.toLocaleString()}</span>
            <span className="mx-2" style={{ color: COLORS.neutralOlive }}>|</span>
            <span className="font-medium" style={{ color: COLORS.softAccent }}>-${totalExpenses.toLocaleString()}</span>
            <span className="mx-2" style={{ color: COLORS.neutralOlive }}>|</span>
            <span 
              className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              ${balance.toLocaleString()}
            </span>
          </div>
          {isExpanded ? 
            <ChevronUp className="w-5 h-5" style={{ color: COLORS.primaryDark }} /> : 
            <ChevronDown className="w-5 h-5" style={{ color: COLORS.primaryDark }} />
          }
        </div>
      </div>

      {/* Transactions List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t" style={{ borderColor: COLORS.secondaryBeige }}>
              {transactions.map((tx) => {
                const category = CATEGORIES.find(c => c.name === tx.category) || CATEGORIES[9];
                const CategoryIcon = category.icon;
                const account = accounts.find(a => a.id === tx.accountId);

                return (
                  <motion.div
                    key={tx.id}
                    className="p-4 flex items-center gap-4 hover:bg-opacity-50 transition-colors group border-b last:border-0"
                    style={{ borderColor: COLORS.secondaryBeige, backgroundColor: 'white' }}
                    whileHover={{ x: 4, backgroundColor: `${COLORS.secondaryBeige}10` }}
                  >
                    <div 
                      className="p-2 rounded-full cursor-pointer"
                      style={{ backgroundColor: `${category.color}20` }}
                      onClick={() => navigate(`/transactions/${tx.id}`)}
                    >
                      <CategoryIcon style={{ color: category.color }} className="w-4 h-4" />
                    </div>
                    
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/transactions/${tx.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate" style={{ color: COLORS.primaryDark }}>
                          {tx.description || tx.category}
                        </p>
                        {account && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ backgroundColor: COLORS.secondaryBeige, color: COLORS.primaryDark }}
                          >
                            <Wallet className="w-3 h-3" />
                            {account.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: COLORS.neutralOlive }}>
                        {new Date(tx.transactionDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => navigate(`/transactions/${tx.id}`)}
                      >
                        <Eye className="w-4 h-4" style={{ color: COLORS.accentWarmGold }} />
                      </Button>
                      
                      <Trash2
                        className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                        style={{ color: COLORS.softAccent }}
                        onClick={() => onDelete(tx.id)}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/////////////////////
// Main Transactions Component
/////////////////////
const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: "Other",
    description: "",
    accountId: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [tx, acc] = await Promise.all([
        transactionsApi.getAll(),
        accountsApi.getAll(),
      ]);
      setTransactions(tx);
      setAccounts(acc);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.accountId) {
      return toast.error("Please select an account");
    }

    if (!form.amount || Number(form.amount) <= 0) {
      return toast.error("Please enter a valid amount greater than 0");
    }

    // Validate that expense-only categories are not used for income
    if (form.type === "income" && EXPENSE_ONLY_CATEGORIES.includes(form.category)) {
      return toast.error(`"${form.category}" is an expense category and cannot be used for income. Please select a different category.`);
    }

    try {
      await transactionsApi.create({
        amount: Number(form.amount),
        type: form.type as "income" | "expense" | "transfer",
        category: form.category,
        description: form.description,
        accountId: form.accountId,
      });

      toast.success("Transaction added!");
      setForm({
        amount: "",
        type: "expense",
        category: "Other",
        description: "",
        accountId: "",
      });
      setShowForm(false);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await transactionsApi.delete(id);
      toast.success("Transaction deleted");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Group transactions by month
  const groupByMonth = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.transactionDate);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(tx);
    });

    // Sort months in descending order
    return Object.entries(groups)
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateB.getTime() - dateA.getTime();
      });
  };

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedMonths(newExpanded);
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const groupedTransactions = groupByMonth(transactions);

  return (
    <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: `${COLORS.secondaryBeige}20` }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: COLORS.primaryDark }}>Transactions</h1>
        <Button 
          onClick={() => setShowForm(!showForm)}
          style={{ backgroundColor: COLORS.primaryDark }}
          className="hover:opacity-90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Add Transaction Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreateTransaction}
            className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl shadow-sm"
            style={{ backgroundColor: 'white', border: `1px solid ${COLORS.secondaryBeige}` }}
          >
            <div>
              <Label style={{ color: COLORS.neutralOlive }}>Amount</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
                required
                style={{ borderColor: COLORS.secondaryBeige }}
                className="focus:ring-2 focus:ring-opacity-50"
                onFocus={(e) => e.target.style.borderColor = COLORS.accentWarmGold}
                onBlur={(e) => e.target.style.borderColor = COLORS.secondaryBeige}
              />
            </div>

            <div>
              <Label style={{ color: COLORS.neutralOlive }}>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => {
                  setForm({ ...form, type: v });
                  // Reset category if current category is expense-only and type changed to income
                  if (v === "income" && EXPENSE_ONLY_CATEGORIES.includes(form.category)) {
                    setForm(prev => ({ ...prev, type: v, category: "Other" }));
                  }
                }}
              >
                <SelectTrigger style={{ borderColor: COLORS.secondaryBeige }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

          <div>
  <Label style={{ color: COLORS.neutralOlive }}>Category</Label>
  <Select
    value={form.category}
    onValueChange={(v) => setForm({ ...form, category: v })}
  >
    <SelectTrigger style={{ borderColor: COLORS.secondaryBeige }}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {getCategoriesByType(form.type as "income" | "expense").map((c) => (
        <SelectItem key={c.name} value={c.name}>
          <div className="flex items-center gap-2">
            <c.icon className="w-4 h-4" style={{ color: c.color }} />
            {c.name}
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

            <div>
              <Label style={{ color: COLORS.neutralOlive }}>Description (Optional)</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                style={{ borderColor: COLORS.secondaryBeige }}
                className="focus:ring-2 focus:ring-opacity-50"
                onFocus={(e) => e.target.style.borderColor = COLORS.accentWarmGold}
                onBlur={(e) => e.target.style.borderColor = COLORS.secondaryBeige}
              />
            </div>

            {/* Account Section */}
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <Label style={{ color: COLORS.neutralOlive }}>Account</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAccountModal(true)}
                  style={{ borderColor: COLORS.secondaryBeige, color: COLORS.primaryDark }}
                >
                  + Add Account
                </Button>
              </div>

              <Select
                value={form.accountId}
                onValueChange={(v) =>
                  setForm({ ...form, accountId: v })
                }
              >
                <SelectTrigger style={{ borderColor: COLORS.secondaryBeige }}>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} ({a.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 flex gap-3">
              <Button 
                type="submit"
                style={{ backgroundColor: COLORS.accentWarmGold }}
                className="hover:opacity-90 text-white"
              >
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
                style={{ color: COLORS.neutralOlive }}
              >
                Cancel
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Account Modal */}
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onCreated={(account) => {
          setAccounts([...accounts, account]);
          setForm({ ...form, accountId: account.id });
        }}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: 'white', border: `1px solid ${COLORS.secondaryBeige}` }}>
          <p className="text-sm" style={{ color: COLORS.neutralOlive }}>Total Income</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.accentWarmGold }}>
            +${transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: 'white', border: `1px solid ${COLORS.secondaryBeige}` }}>
          <p className="text-sm" style={{ color: COLORS.neutralOlive }}>Total Expenses</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.softAccent }}>
            -${transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: 'white', border: `1px solid ${COLORS.secondaryBeige}` }}>
          <p className="text-sm" style={{ color: COLORS.neutralOlive }}>Net Balance</p>
          <p className={`text-2xl font-bold ${(() => {
            const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            return income - expenses >= 0 ? 'text-green-600' : 'text-red-600';
          })()}`}>
            ${(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - 
               transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Transactions by Month */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8" style={{ color: COLORS.primaryDark }}>Loading...</div>
        ) : groupedTransactions.length === 0 ? (
          <div className="text-center py-8" style={{ color: COLORS.neutralOlive }}>
            No transactions yet. Click "Add Transaction" to get started.
          </div>
        ) : (
          groupedTransactions.map(([month, monthTransactions]) => (
            <MonthSection
              key={month}
              month={month}
              transactions={monthTransactions}
              accounts={accounts}
              isCurrentMonth={month === currentMonth}
              onDelete={handleDelete}
              isExpanded={expandedMonths.has(month) || month === currentMonth}
              onToggle={() => toggleMonth(month)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;