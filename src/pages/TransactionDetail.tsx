import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
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
  ArrowUpRight, ArrowDownRight, Calendar, 
  Home, ShoppingBag, Coffee, Car, Film,
  Briefcase, Code, TrendingUp, PiggyBank, MoreHorizontal,
  CreditCard, ArrowLeft, Edit, Download, Share2, Save, X
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

/////////////////////
// Categories with Icons & Colors
/////////////////////
const CATEGORIES = [
  { name: "Rent", icon: Home, color: COLORS.primaryDark },
  { name: "Grocery", icon: ShoppingBag, color: COLORS.accentWarmGold },
  { name: "Dining", icon: Coffee, color: COLORS.softAccent },
  { name: "Transport", icon: Car, color: COLORS.neutralOlive },
  { name: "Entertainment", icon: Film, color: COLORS.secondaryBeige },
  { name: "Salary", icon: Briefcase, color: COLORS.accentWarmGold },
  { name: "Freelance", icon: Code, color: COLORS.primaryDark },
  { name: "Investment", icon: TrendingUp, color: COLORS.neutralOlive },
  { name: "Savings", icon: PiggyBank, color: COLORS.softAccent },
  { name: "Other", icon: MoreHorizontal, color: COLORS.secondaryBeige },
];

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: "",
    type: "",
    category: "",
    description: "",
    accountId: "",
    transactionDate: "",
  });

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const [allTransactions, allAccounts] = await Promise.all([
        transactionsApi.getAll(),
        accountsApi.getAll(),
      ]);
      
      const found = allTransactions.find(t => t.id === id);
      if (!found) {
        toast.error("Transaction not found");
        navigate('/transactions');
        return;
      }
      
      setTransaction(found);
      setAccounts(allAccounts);
      setEditForm({
        amount: found.amount.toString(),
        type: found.type,
        category: found.category || "Other",
        description: found.description || "",
        accountId: found.accountId,
        transactionDate: found.transactionDate.split('T')[0],
      });
      
      const foundAccount = allAccounts.find(a => a.id === found.accountId);
      setAccount(foundAccount || null);
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!transaction) return;
    
    try {
      await transactionsApi.delete(transaction.id);
      toast.success("Transaction deleted");
      navigate('/transactions');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    setSaving(true);
    try {
      await transactionsApi.update(transaction.id, {
        amount: Number(editForm.amount),
        type: editForm.type as "income" | "expense" | "transfer",
        category: editForm.category,
        description: editForm.description,
        accountId: editForm.accountId,
       transactionDate: new Date(editForm.transactionDate).toISOString(),
      });

      toast.success("Transaction updated successfully!");
      setIsEditing(false);
      await loadTransaction();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: `${COLORS.secondaryBeige}20` }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: COLORS.accentWarmGold }}></div>
          <p className="mt-4" style={{ color: COLORS.neutralOlive }}>Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (!transaction) return null;

  const category = CATEGORIES.find(c => c.name === transaction.category) || CATEGORIES[9];
  const CategoryIcon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
      style={{ backgroundColor: `${COLORS.secondaryBeige}20` }}
    >
      {/* Header */}
      <div className="border-b sticky top-0 z-10 backdrop-blur-sm" style={{ backgroundColor: 'white', borderColor: COLORS.secondaryBeige }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/transactions')}
              className="gap-2"
              style={{ color: COLORS.primaryDark }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Transactions
            </Button>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                    style={{ borderColor: COLORS.secondaryBeige, color: COLORS.primaryDark }}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Delete
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="gap-2"
                  style={{ borderColor: COLORS.secondaryBeige, color: COLORS.primaryDark }}
                >
                  <X className="w-4 h-4" />
                  Cancel Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="overflow-hidden rounded-2xl shadow-sm mb-6"
            style={{ backgroundColor: 'white', border: `1px solid ${COLORS.secondaryBeige}` }}
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="p-4 rounded-2xl"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <CategoryIcon style={{ color: category.color }} className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: COLORS.primaryDark }}>Transaction Details</h1>
                  <p className="flex items-center gap-2 mt-1" style={{ color: COLORS.neutralOlive }}>
                    <Calendar className="w-4 h-4" />
                    {new Date(transaction.transactionDate).toLocaleDateString('default', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {isEditing ? (
                // Edit Form
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label style={{ color: COLORS.neutralOlive }}>Amount</Label>
                      <Input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
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
                        value={editForm.type}
                        onValueChange={(v) => setEditForm({ ...editForm, type: v })}
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
                        value={editForm.category}
                        onValueChange={(v) => setEditForm({ ...editForm, category: v })}
                      >
                        <SelectTrigger style={{ borderColor: COLORS.secondaryBeige }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
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
                      <Label style={{ color: COLORS.neutralOlive }}>Date</Label>
                      <Input
                        type="date"
                        value={editForm.transactionDate}
                        onChange={(e) => setEditForm({ ...editForm, transactionDate: e.target.value })}
                        required
                        style={{ borderColor: COLORS.secondaryBeige }}
                        className="focus:ring-2 focus:ring-opacity-50"
                        onFocus={(e) => e.target.style.borderColor = COLORS.accentWarmGold}
                        onBlur={(e) => e.target.style.borderColor = COLORS.secondaryBeige}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label style={{ color: COLORS.neutralOlive }}>Description</Label>
                      <Input
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        style={{ borderColor: COLORS.secondaryBeige }}
                        className="focus:ring-2 focus:ring-opacity-50"
                        onFocus={(e) => e.target.style.borderColor = COLORS.accentWarmGold}
                        onBlur={(e) => e.target.style.borderColor = COLORS.secondaryBeige}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label style={{ color: COLORS.neutralOlive }}>Account</Label>
                      <Select
                        value={editForm.accountId}
                        onValueChange={(v) => setEditForm({ ...editForm, accountId: v })}
                      >
                        <SelectTrigger style={{ borderColor: COLORS.secondaryBeige }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name} ({a.type}) - ${a.balance}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="gap-2 text-white"
                      style={{ backgroundColor: COLORS.accentWarmGold }}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      style={{ borderColor: COLORS.secondaryBeige, color: COLORS.primaryDark }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                // View Mode
                <div className="space-y-6">
                  {/* Amount Card */}
                  <div 
                    className="p-6 rounded-xl text-center"
                    style={{ backgroundColor: `${COLORS.secondaryBeige}20` }}
                  >
                    <p className="text-sm mb-2" style={{ color: COLORS.neutralOlive }}>Amount</p>
                    <p className={`text-5xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.secondaryBeige}20` }}>
                      <p className="text-sm mb-1" style={{ color: COLORS.neutralOlive }}>Type</p>
                      <p className="text-lg font-medium flex items-center gap-2" style={{ color: COLORS.primaryDark }}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600" />
                        )}
                        {transaction.type}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.secondaryBeige}20` }}>
                      <p className="text-sm mb-1" style={{ color: COLORS.neutralOlive }}>Category</p>
                      <p className="text-lg font-medium flex items-center gap-2" style={{ color: COLORS.primaryDark }}>
                        <CategoryIcon style={{ color: category.color }} className="w-5 h-5" />
                        {transaction.category}
                      </p>
                    </div>

                    {transaction.description && (
                      <div className="md:col-span-2 p-4 rounded-lg" style={{ backgroundColor: `${COLORS.secondaryBeige}20` }}>
                        <p className="text-sm mb-1" style={{ color: COLORS.neutralOlive }}>Description</p>
                        <p className="text-lg" style={{ color: COLORS.primaryDark }}>{transaction.description}</p>
                      </div>
                    )}

                    {account && (
                      <div className="md:col-span-2 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: `${COLORS.secondaryBeige}20` }}>
                        <CreditCard className="w-6 h-6" style={{ color: COLORS.accentWarmGold }} />
                        <div>
                          <p className="text-sm" style={{ color: COLORS.neutralOlive }}>Account</p>
                          <p className="text-lg font-medium" style={{ color: COLORS.primaryDark }}>{account.name}</p>
                          <p className="text-sm" style={{ color: COLORS.neutralOlive }}>{account.type} • Balance: ${account.balance.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="border-t pt-4 mt-4" style={{ borderColor: COLORS.secondaryBeige }}>
                    <p className="text-sm" style={{ color: COLORS.neutralOlive }}>
                      Transaction ID: {transaction.id}
                    </p>
                    <p className="text-sm" style={{ color: COLORS.neutralOlive }}>
                      Created: {new Date(transaction.transactionDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end gap-3"
          >
            <Button 
              variant="outline" 
              className="gap-2"
              style={{ borderColor: COLORS.secondaryBeige, color: COLORS.primaryDark }}
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              style={{ borderColor: COLORS.secondaryBeige, color: COLORS.primaryDark }}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionDetail;