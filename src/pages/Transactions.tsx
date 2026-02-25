import { useEffect, useState, useMemo } from "react";
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
  CreditCard, Wallet, CalendarDays, Search, X,
  Filter, Download, RefreshCw, AlertCircle, ChevronLeft, ChevronRight
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
// Loading Spinner Component
/////////////////////
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.accentWarmGold }}></div>
  </div>
);

/////////////////////
// Error Display Component
/////////////////////
const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="text-center py-12 px-4">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: `${COLORS.softAccent}20` }}>
      <AlertCircle className="w-8 h-8" style={{ color: COLORS.softAccent }} />
    </div>
    <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.primaryDark }}>Oops! Something went wrong</h3>
    <p className="mb-4" style={{ color: COLORS.neutralOlive }}>{message}</p>
    <Button 
      onClick={onRetry}
      style={{ backgroundColor: COLORS.accentWarmGold }}
      className="hover:opacity-90 text-white"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Try Again
    </Button>
  </div>
);

/////////////////////
// Empty State Component
/////////////////////
const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div className="text-center py-12 px-4">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: `${COLORS.secondaryBeige}30` }}>
      <Wallet className="w-8 h-8" style={{ color: COLORS.primaryDark }} />
    </div>
    <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.primaryDark }}>No transactions yet</h3>
    <p className="mb-4" style={{ color: COLORS.neutralOlive }}>Get started by adding your first transaction</p>
    <Button 
      onClick={onAdd}
      style={{ backgroundColor: COLORS.accentWarmGold }}
      className="hover:opacity-90 text-white"
    >
      <Plus className="w-4 h-4 mr-2" />
      Add Transaction
    </Button>
  </div>
);

/////////////////////
// Category Totals Component
/////////////////////
interface CategoryTotalsProps {
  transactions: Transaction[];
  type: 'income' | 'expense';
}

const CategoryTotals = ({ transactions, type }: CategoryTotalsProps) => {
  const filteredTransactions = transactions.filter(t => t.type === type);
  
  const categoryTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    filteredTransactions.forEach(t => {
      const category = t.category || 'Other';
      totals[category] = (totals[category] || 0) + t.amount;
    });
    
    return Object.entries(totals)
      .map(([category, total]) => ({
        category,
        total,
        icon: CATEGORIES.find(c => c.name === category) || CATEGORIES[CATEGORIES.length - 1]
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredTransactions]);

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  if (categoryTotals.length === 0) return null;

  return (
    <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: 'white', border: `1px solid ${COLORS.secondaryBeige}` }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold" style={{ color: COLORS.primaryDark }}>
          {type === 'income' ? 'Income by Category' : 'Expenses by Category'}
        </h3>
        <span className="text-sm font-medium" style={{ color: COLORS.neutralOlive }}>
          Total: {totalAmount.toLocaleString()}
        </span>
      </div>
      <div className="space-y-2">
        {categoryTotals.map(({ category, total, icon }) => {
          const percentage = (total / totalAmount) * 100;
          const IconComponent = icon.icon;
          
          return (
            <div key={category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" style={{ color: icon.color }} />
                  <span style={{ color: COLORS.primaryDark }}>{category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={{ color: type === 'income' ? '#16a34a' : '#dc2626' }}>
                    {total.toLocaleString()}
                  </span>
                  <span className="text-xs" style={{ color: COLORS.neutralOlive }}>
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${COLORS.secondaryBeige}30` }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: type === 'income' ? COLORS.accentWarmGold : COLORS.softAccent 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string } = {};
    if (!form.name.trim()) {
      newErrors.name = "Account name is required";
    } else if (form.name.length < 3) {
      newErrors.name = "Account name must be at least 3 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const account = await accountsApi.create(form);
      toast.success("Account created successfully!");
      onCreated(account);
      setForm({ name: "", type: "Checking", balance: 0 });
      setErrors({});
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.primaryDark }}>Create New Account</h2>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div>
            <Label style={{ color: COLORS.neutralOlive }}>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) setErrors({});
              }}
              required
              style={{ borderColor: errors.name ? '#ef4444' : COLORS.secondaryBeige }}
              className="focus:ring-2 focus:ring-opacity-50"
              onFocus={(e) => e.target.style.borderColor = COLORS.accentWarmGold}
              onBlur={(e) => e.target.style.borderColor = errors.name ? '#ef4444' : COLORS.secondaryBeige}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
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
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/////////////////////
// Transaction Item Component
/////////////////////
interface TransactionItemProps {
  transaction: Transaction;
  account?: Account;
  searchTerm?: string;
  onDelete: (id: string) => void;
  onClick: () => void;
}

const TransactionItem = ({ transaction, account, searchTerm = '', onDelete, onClick }: TransactionItemProps) => {
  const category = CATEGORIES.find(c => c.name === transaction.category) || CATEGORIES[CATEGORIES.length - 1];
  const CategoryIcon = category.icon;

  // Highlight matching text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? 
        <span key={i} className="bg-yellow-200 font-medium">{part}</span> : 
        part
    );
  };

  return (
    <motion.div
      className="p-4 flex items-center gap-4 hover:bg-opacity-50 transition-colors group border-b last:border-0"
      style={{ borderColor: COLORS.secondaryBeige, backgroundColor: 'white' }}
      whileHover={{ x: 4, backgroundColor: `${COLORS.secondaryBeige}10` }}
    >
      <div 
        className="p-2 rounded-full cursor-pointer"
        style={{ backgroundColor: `${category.color}20` }}
        onClick={onClick}
      >
        <CategoryIcon style={{ color: category.color }} className="w-4 h-4" />
      </div>
      
      <div 
        className="flex-1 min-w-0 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center gap-2">
          <p className="font-medium truncate" style={{ color: COLORS.primaryDark }}>
            {searchTerm ? highlightText(transaction.description || transaction.category || '', searchTerm) : (transaction.description || transaction.category)}
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
          {new Date(transaction.transactionDate).toLocaleDateString()}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()}
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onClick}
        >
          <Eye className="w-4 h-4" style={{ color: COLORS.accentWarmGold }} />
        </Button>
        
        <Trash2
          className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
          style={{ color: COLORS.softAccent }}
          onClick={() => onDelete(transaction.id)}
        />
      </div>
    </motion.div>
  );
};

/////////////////////
// Month Section Component
/////////////////////
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
  searchTerm?: string;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const MonthSection = ({ 
  month, 
  transactions, 
  accounts,
  isCurrentMonth,
  onDelete,
  isExpanded,
  onToggle,
  searchTerm = '',
  currentPage,
  itemsPerPage,
  onPageChange
}: MonthSectionProps) => {
  const navigate = useNavigate();
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Pagination for transactions within this month
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, transactions.length);
  const paginatedTransactions = transactions.slice(startIndex, endIndex);
  const hasMultiplePages = totalPages > 1;

  // Determine if we should show pagination (always show if totalPages > 1)
  const showPagination = totalPages > 1;

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
            {!isExpanded && transactions.length > 0 && (
              <span className="ml-2 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: COLORS.secondaryBeige, color: COLORS.primaryDark }}>
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </span>
            )}
          </h2>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="font-medium" style={{ color: COLORS.accentWarmGold }}>+{totalIncome.toLocaleString()}</span>
            <span className="mx-2" style={{ color: COLORS.neutralOlive }}>|</span>
            <span className="font-medium" style={{ color: COLORS.softAccent }}>-{totalExpenses.toLocaleString()}</span>
            <span className="mx-2" style={{ color: COLORS.neutralOlive }}>|</span>
            <span 
              className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {balance.toLocaleString()}
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
              {transactions.length === 0 ? (
                <div className="p-8 text-center" style={{ color: COLORS.neutralOlive }}>
                  No transactions in this month
                </div>
              ) : (
                <>
                  {paginatedTransactions.map((tx) => {
                    const account = accounts.find(a => a.id === tx.accountId);
                    return (
                      <TransactionItem
                        key={tx.id}
                        transaction={tx}
                        account={account}
                        searchTerm={searchTerm}
                        onDelete={onDelete}
                        onClick={() => navigate(`/transactions/${tx.id}`)}
                      />
                    );
                  })}
                  
                  {/* Show "blank" rows if we have fewer than itemsPerPage and it's the last page */}
                  {!hasMultiplePages && paginatedTransactions.length < itemsPerPage && paginatedTransactions.length > 0 && (
                    <div className="border-t border-dashed" style={{ borderColor: `${COLORS.secondaryBeige}40` }}>
                      {Array.from({ length: itemsPerPage - paginatedTransactions.length }).map((_, index) => (
                        <div 
                          key={`blank-${index}`}
                          className="p-4 flex items-center gap-4 opacity-30"
                          style={{ backgroundColor: `${COLORS.secondaryBeige}05` }}
                        >
                          <div className="p-2 rounded-full" style={{ backgroundColor: `${COLORS.neutralOlive}10` }}>
                            <div className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="h-4 w-32 rounded" style={{ backgroundColor: `${COLORS.neutralOlive}10` }} />
                            <div className="h-3 w-24 rounded mt-1" style={{ backgroundColor: `${COLORS.neutralOlive}10` }} />
                          </div>
                          <div className="w-20 h-4 rounded" style={{ backgroundColor: `${COLORS.neutralOlive}10` }} />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Pagination Info - Always show when expanded with transactions */}
                  <div className="p-3 flex items-center justify-between border-t" style={{ borderColor: COLORS.secondaryBeige, backgroundColor: `${COLORS.secondaryBeige}08` }}>
                    <div className="text-xs" style={{ color: COLORS.neutralOlive }}>
                      Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{transactions.length}</span> transactions
                      {!hasMultiplePages && transactions.length < itemsPerPage && (
                        <span className="ml-1">(all transactions)</span>
                      )}
                    </div>
                    
                    {/* Pagination Controls - Only show if multiple pages */}
                    {showPagination && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0"
                          style={{ color: currentPage === 1 ? COLORS.neutralOlive : COLORS.primaryDark }}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        
                        {/* Page indicators */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={i}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-7 h-7 rounded-full text-xs font-medium transition-colors
                                  ${currentPage === pageNum 
                                    ? 'text-white' 
                                    : 'hover:bg-opacity-20'}`}
                                style={{
                                  backgroundColor: currentPage === pageNum ? COLORS.accentWarmGold : 'transparent',
                                  color: currentPage === pageNum ? 'white' : COLORS.primaryDark
                                }}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 p-0"
                          style={{ color: currentPage === totalPages ? COLORS.neutralOlive : COLORS.primaryDark }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Simple page indicator for single page */}
                    {!showPagination && transactions.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: COLORS.secondaryBeige, color: COLORS.primaryDark }}>
                          Page 1 of 1
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
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
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [monthPages, setMonthPages] = useState<{ [key: string]: number }>({});
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: "Other",
    description: "",
    accountId: "",
  });
  const [formErrors, setFormErrors] = useState<{
    amount?: string;
    accountId?: string;
    category?: string;
  }>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tx, acc] = await Promise.all([
        transactionsApi.getAll(),
        accountsApi.getAll(),
      ]);
      setTransactions(tx);
      setAccounts(acc);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const validateTransactionForm = () => {
    const errors: typeof formErrors = {};
    
    if (!form.accountId) {
      errors.accountId = "Please select an account";
    }
    
    if (!form.amount) {
      errors.amount = "Amount is required";
    } else if (Number(form.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    } else if (Number(form.amount) > 1000000) {
      errors.amount = "Amount exceeds maximum limit";
    }
    
    if (form.type === "income" && EXPENSE_ONLY_CATEGORIES.includes(form.category)) {
      errors.category = `"${form.category}" cannot be used for income`;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTransactionForm()) {
      return;
    }

    try {
      await transactionsApi.create({
        amount: Number(form.amount),
        type: form.type as "income" | "expense" | "transfer",
        category: form.category,
        description: form.description,
        accountId: form.accountId,
      });

      toast.success("Transaction added successfully!");
      setForm({
        amount: "",
        type: "expense",
        category: "Other",
        description: "",
        accountId: "",
      });
      setFormErrors({});
      setShowForm(false);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to add transaction");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await transactionsApi.delete(id);
      toast.success("Transaction deleted");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete transaction");
    }
  };

  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.category && tx.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Type filter
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      
      // Category filter
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
      
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter]);

  // Group filtered transactions by month
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

  const groupedTransactions = useMemo(() => groupByMonth(filteredTransactions), [filteredTransactions]);

  // Handle month page change
  const handleMonthPageChange = (month: string, page: number) => {
    setMonthPages(prev => ({ ...prev, [month]: page }));
  };

  // Reset month pages when filters change
  useEffect(() => {
    setMonthPages({});
  }, [searchTerm, typeFilter, categoryFilter]);

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
      // Reset to first page when expanding
      setMonthPages(prev => ({ ...prev, [month]: 1 }));
    }
    setExpandedMonths(newExpanded);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [transactions]);

  if (loading) {
    return (
      <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: `${COLORS.secondaryBeige}20` }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6 min-h-screen" style={{ backgroundColor: `${COLORS.secondaryBeige}20` }}>
        <ErrorDisplay message={error} onRetry={load} />
      </div>
    );
  }

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
                max="1000000"
                value={form.amount}
                onChange={(e) => {
                  setForm({ ...form, amount: e.target.value });
                  if (formErrors.amount) setFormErrors({});
                }}
                required
                style={{ borderColor: formErrors.amount ? '#ef4444' : COLORS.secondaryBeige }}
                className="focus:ring-2 focus:ring-opacity-50"
                onFocus={(e) => e.target.style.borderColor = COLORS.accentWarmGold}
                onBlur={(e) => e.target.style.borderColor = formErrors.amount ? '#ef4444' : COLORS.secondaryBeige}
              />
              {formErrors.amount && (
                <p className="text-sm text-red-500 mt-1">{formErrors.amount}</p>
              )}
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
                onValueChange={(v) => {
                  setForm({ ...form, category: v });
                  if (formErrors.category) setFormErrors({});
                }}
              >
                <SelectTrigger style={{ borderColor: formErrors.category ? '#ef4444' : COLORS.secondaryBeige }}>
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
              {formErrors.category && (
                <p className="text-sm text-red-500 mt-1">{formErrors.category}</p>
              )}
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
                onValueChange={(v) => {
                  setForm({ ...form, accountId: v });
                  if (formErrors.accountId) setFormErrors({});
                }}
              >
                <SelectTrigger style={{ borderColor: formErrors.accountId ? '#ef4444' : COLORS.secondaryBeige }}>
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
              {formErrors.accountId && (
                <p className="text-sm text-red-500 mt-1">{formErrors.accountId}</p>
              )}
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
                onClick={() => {
                  setShowForm(false);
                  setFormErrors({});
                }}
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
        <motion.div 
          className="p-4 rounded-xl shadow-sm" 
          style={{ backgroundColor: 'white', border: `1px solid ${COLORS.secondaryBeige}` }}
          whileHover={{ y: -2 }}
        >
          <p className="text-sm" style={{ color: COLORS.neutralOlive }}>Total Income</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.accentWarmGold }}>
            +{transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
          </p>
        </motion.div>
        <motion.div 
          className="p-4 rounded-xl shadow-sm" 
          style={{ backgroundColor: 'white', border: `1px solid ${COLORS.secondaryBeige}` }}
          whileHover={{ y: -2 }}
        >
          <p className="text-sm" style={{ color: COLORS.neutralOlive }}>Total Expenses</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.softAccent }}>
            -{transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
          </p>
        </motion.div>
        <motion.div 
          className="p-4 rounded-xl shadow-sm" 
          style={{ backgroundColor: 'white', border: `1px solid ${COLORS.secondaryBeige}` }}
          whileHover={{ y: -2 }}
        >
          <p className="text-sm" style={{ color: COLORS.neutralOlive }}>Net Balance</p>
          <p className={`text-2xl font-bold ${(() => {
            const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            return income - expenses >= 0 ? 'text-green-600' : 'text-red-600';
          })()}`}>
            {(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - 
               transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)).toLocaleString()}
          </p>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm" style={{ border: `1px solid ${COLORS.secondaryBeige}` }}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: COLORS.neutralOlive }} />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              style={{ borderColor: COLORS.secondaryBeige }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4" style={{ color: COLORS.neutralOlive }} />
              </button>
            )}
          </div>
          
          <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
            <SelectTrigger className="w-[140px]" style={{ borderColor: COLORS.secondaryBeige }}>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]" style={{ borderColor: COLORS.secondaryBeige }}>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchTerm || typeFilter !== 'all' || categoryFilter !== 'all') && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              style={{ color: COLORS.neutralOlive }}
            >
              Clear Filters
            </Button>
          )}
        </div>
        
        <div className="mt-2 text-sm" style={{ color: COLORS.neutralOlive }}>
          Found {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Category Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoryTotals transactions={filteredTransactions} type="income" />
        <CategoryTotals transactions={filteredTransactions} type="expense" />
      </div>

      {/* Transactions by Month */}
      <div className="space-y-4">
        {groupedTransactions.length === 0 ? (
          <EmptyState onAdd={() => setShowForm(true)} />
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
              searchTerm={searchTerm}
              currentPage={monthPages[month] || 1}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => handleMonthPageChange(month, page)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;