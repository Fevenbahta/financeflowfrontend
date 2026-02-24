import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { goalsApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Target } from "lucide-react";

const Goals = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", targetAmount: "", targetDate: "" });
  const [addAmounts, setAddAmounts] = useState<Record<string, string>>({});

  // Load all goals
  const load = async () => {
    try {
      const data = await goalsApi.getAll();
      setGoals(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Create a new goal
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await goalsApi.create({
        title: form.title,
        targetAmount: Number(form.targetAmount),
        targetDate: form.targetDate || undefined,
      });
      toast.success("Goal created!");
      setShowForm(false);
      setForm({ title: "", targetAmount: "", targetDate: "" });
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Add progress to a goal (optimistic UI)
  const handleAddProgress = async (id: string) => {
    const amt = Number(addAmounts[id]);
    if (!amt) return;

    try {
      await goalsApi.update(id, amt);
      toast.success("Progress updated!");

      // Optimistically update local state
      setGoals(prev =>
        prev.map(g => g.id === id
          ? { ...g, currentAmount: (g.currentAmount || 0) + amt }
          : g
        )
      );

      setAddAmounts({ ...addAmounts, [id]: "" });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Delete a goal
  const handleDelete = async (id: string) => {
    try {
      await goalsApi.delete(id);
      toast.success("Deleted");
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Financial Goals</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gradient-warm text-accent-foreground border-0 rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> New Goal
        </Button>
      </div>

      {/* Create Goal Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="glass-card p-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Target Amount</Label>
            <Input
              type="number"
              value={form.targetAmount}
              onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Target Date</Label>
            <Input
              type="date"
              value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="sm:col-span-3 flex gap-3">
            <Button type="submit" className="gradient-warm text-accent-foreground border-0 rounded-xl">Create</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
          </div>
        </motion.form>
      )}

      {/* No goals message */}
      {goals.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No goals yet. Set your first target!</p>
      )}

      {/* Goals list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal, i) => {
          const pct = goal.targetAmount > 0
            ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
            : 0;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 space-y-4"
            >
              {/* Header with title and delete */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{goal.title}</h3>
                    {goal.targetDate && (
                      <p className="text-xs text-muted-foreground">
                        By {new Date(goal.targetDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="text-muted-foreground hover:text-destructive transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{goal.currentAmount?.toLocaleString()}</span>
                  <span className="font-medium text-accent">{pct}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gradient-gold rounded-full"
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Target: {goal.targetAmount?.toLocaleString()}
                </p>
              </div>

              {/* Add progress */}
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Add amount"
                  value={addAmounts[goal.id] || ""}
                  onChange={(e) => setAddAmounts({ ...addAmounts, [goal.id]: e.target.value })}
                  className="rounded-xl h-9 text-sm"
                />
                <Button
                  size="sm"
                  onClick={() => handleAddProgress(goal.id)}
                  className="gradient-warm text-accent-foreground border-0 rounded-xl h-9"
                >
                  Add
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Goals;