import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { notificationsApi } from "@/services/api";
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";

const iconMap: Record<string, any> = {
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.getAll().then(setNotifications).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>

      {notifications.length === 0 && (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No notifications yet. You're all caught up!</p>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((n, i) => {
          const Icon = iconMap[n.type] || Info;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-panel p-4 flex items-start gap-4 ${n.is_read ? "opacity-60" : ""}`}
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{n.message}</p>
                {n.created_at && <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
