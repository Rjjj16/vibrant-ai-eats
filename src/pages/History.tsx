import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfDay, endOfDay, subDays, isToday, isYesterday } from "date-fns";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Coffee, 
  Sun, 
  Sunset, 
  Cookie, 
  Flame, 
  Beef, 
  Wheat, 
  Droplets,
  ArrowLeft,
  Trash2,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FoodLog {
  id: string;
  food_name: string;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving_size: string | null;
  confidence: string | null;
  notes: string | null;
  logged_at: string;
  created_at: string;
}

const mealIcons: Record<string, React.ReactNode> = {
  breakfast: <Coffee className="w-4 h-4" />,
  lunch: <Sun className="w-4 h-4" />,
  dinner: <Sunset className="w-4 h-4" />,
  snacks: <Cookie className="w-4 h-4" />,
};

const mealColors: Record<string, string> = {
  breakfast: "from-amber-500 to-orange-500",
  lunch: "from-green-500 to-emerald-500",
  dinner: "from-blue-500 to-indigo-500",
  snacks: "from-purple-500 to-pink-500",
};

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [mealFilter, setMealFilter] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user, selectedDate]);

  const fetchLogs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const start = startOfDay(selectedDate).toISOString();
      const end = endOfDay(selectedDate).toISOString();

      const { data, error } = await supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", start)
        .lte("logged_at", end)
        .order("logged_at", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Error",
        description: "Failed to load meal history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id: string) => {
    try {
      const { error } = await supabase.from("food_logs").delete().eq("id", id);
      if (error) throw error;
      
      setLogs(logs.filter((log) => log.id !== id));
      toast({
        title: "Deleted",
        description: "Meal log removed successfully",
      });
    } catch (error) {
      console.error("Error deleting log:", error);
      toast({
        title: "Error",
        description: "Failed to delete meal log",
        variant: "destructive",
      });
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    setSelectedDate((prev) =>
      direction === "prev" ? subDays(prev, 1) : subDays(prev, -1)
    );
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d");
  };

  const filteredLogs = mealFilter === "all" 
    ? logs 
    : logs.filter(log => log.meal_type === mealFilter);

  const totals = logs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + Number(log.protein),
      carbs: acc.carbs + Number(log.carbs),
      fat: acc.fat + Number(log.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-lg font-semibold font-display">Meal History</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Date Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate("prev")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-lg font-medium">{getDateLabel(selectedDate)}</span>
            {!isToday(selectedDate) && (
              <span className="text-sm text-muted-foreground">
                {format(selectedDate, "MMM d, yyyy")}
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate("next")}
            disabled={isToday(selectedDate)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Daily Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Daily Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg font-bold">{totals.calories}</p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <Beef className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg font-bold">{totals.protein.toFixed(0)}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                    <Wheat className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg font-bold">{totals.carbs.toFixed(0)}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg font-bold">{totals.fat.toFixed(0)}g</p>
                  <p className="text-xs text-muted-foreground">Fat</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filter */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {filteredLogs.length} meal{filteredLogs.length !== 1 ? "s" : ""} logged
          </h2>
          <Select value={mealFilter} onValueChange={setMealFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Meals</SelectItem>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snacks">Snacks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Meal Logs */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-muted/50 animate-pulse"
                />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Coffee className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No meals logged</h3>
              <p className="text-sm text-muted-foreground">
                {isToday(selectedDate)
                  ? "Start scanning food to track your meals"
                  : "No meals were logged on this day"}
              </p>
              {isToday(selectedDate) && (
                <Button
                  variant="gradient"
                  className="mt-4"
                  onClick={() => navigate("/#scanner")}
                >
                  Scan Food
                </Button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card border-0 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                              mealColors[log.meal_type] || mealColors.snacks
                            } flex items-center justify-center flex-shrink-0`}
                          >
                            {mealIcons[log.meal_type] || mealIcons.snacks}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">{log.food_name}</h3>
                              <Badge variant="secondary" className="capitalize text-xs">
                                {log.meal_type}
                              </Badge>
                            </div>
                            {log.serving_size && (
                              <p className="text-xs text-muted-foreground mb-2">
                                {log.serving_size}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs">
                              <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3 text-orange-500" />
                                {log.calories} cal
                              </span>
                              <span className="flex items-center gap-1">
                                <Beef className="w-3 h-3 text-red-500" />
                                {Number(log.protein).toFixed(0)}g
                              </span>
                              <span className="flex items-center gap-1">
                                <Wheat className="w-3 h-3 text-amber-500" />
                                {Number(log.carbs).toFixed(0)}g
                              </span>
                              <span className="flex items-center gap-1">
                                <Droplets className="w-3 h-3 text-blue-500" />
                                {Number(log.fat).toFixed(0)}g
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.logged_at), "h:mm a")}
                          </span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete meal log?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove "{log.food_name}" from your meal history.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteLog(log.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {log.notes && (
                        <p className="mt-3 text-xs text-muted-foreground border-t border-border/50 pt-3">
                          {log.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
