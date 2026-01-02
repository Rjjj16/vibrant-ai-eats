import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Sun, Sunset, Cookie, Flame, Beef, Wheat, Droplet, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MealSummary {
  meal_type: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  food_count: number;
}

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const mealIcons: Record<string, typeof Coffee> = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Sunset,
  snacks: Cookie,
};

const mealColors: Record<string, string> = {
  breakfast: 'from-amber-500 to-orange-500',
  lunch: 'from-green-500 to-emerald-500',
  dinner: 'from-purple-500 to-pink-500',
  snacks: 'from-blue-500 to-cyan-500',
};

// Daily goals
const GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};

const DailyProgress = () => {
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [totals, setTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTodaysMeals = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', today.toISOString());

      if (error) {
        console.error('Error fetching meals:', error);
        return;
      }

      // Group by meal type
      const mealMap = new Map<string, MealSummary>();
      let dailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

      data?.forEach((log) => {
        const existing = mealMap.get(log.meal_type) || {
          meal_type: log.meal_type,
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
          food_count: 0,
        };

        existing.total_calories += log.calories || 0;
        existing.total_protein += Number(log.protein) || 0;
        existing.total_carbs += Number(log.carbs) || 0;
        existing.total_fat += Number(log.fat) || 0;
        existing.food_count += 1;

        dailyTotals.calories += log.calories || 0;
        dailyTotals.protein += Number(log.protein) || 0;
        dailyTotals.carbs += Number(log.carbs) || 0;
        dailyTotals.fat += Number(log.fat) || 0;

        mealMap.set(log.meal_type, existing);
      });

      setMeals(Array.from(mealMap.values()));
      setTotals(dailyTotals);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysMeals();
  }, [user]);

  if (!user) {
    return null;
  }

  const getProgress = (current: number, goal: number) => Math.min((current / goal) * 100, 100);

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Today's Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Macro progress bars */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <MacroProgress
                  icon={Flame}
                  label="Calories"
                  current={totals.calories}
                  goal={GOALS.calories}
                  unit="kcal"
                  color="from-orange-500 to-red-500"
                />
                <MacroProgress
                  icon={Beef}
                  label="Protein"
                  current={totals.protein}
                  goal={GOALS.protein}
                  unit="g"
                  color="from-red-500 to-pink-500"
                />
                <MacroProgress
                  icon={Wheat}
                  label="Carbs"
                  current={totals.carbs}
                  goal={GOALS.carbs}
                  unit="g"
                  color="from-amber-500 to-yellow-500"
                />
                <MacroProgress
                  icon={Droplet}
                  label="Fat"
                  current={totals.fat}
                  goal={GOALS.fat}
                  unit="g"
                  color="from-blue-500 to-cyan-500"
                />
              </div>

              {/* Meals breakdown */}
              {meals.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Meals Today</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {meals.map((meal) => {
                      const Icon = mealIcons[meal.meal_type] || Coffee;
                      const color = mealColors[meal.meal_type] || 'from-gray-500 to-gray-600';
                      
                      return (
                        <div
                          key={meal.meal_type}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground capitalize">{meal.meal_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {meal.food_count} item(s) • {meal.total_calories} cal
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{meal.total_protein.toFixed(0)}g P</p>
                            <p className="text-xs text-muted-foreground">
                              {meal.total_carbs.toFixed(0)}g C • {meal.total_fat.toFixed(0)}g F
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No meals logged yet today.</p>
                  <p className="text-sm">Scan your first meal to get started!</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

interface MacroProgressProps {
  icon: typeof Flame;
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}

const MacroProgress = ({ icon: Icon, label, current, goal, unit, color }: MacroProgressProps) => {
  const progress = Math.min((current / goal) * 100, 100);
  
  return (
    <div className="bg-muted/50 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="mb-1">
        <span className="text-lg font-bold text-foreground">{Math.round(current)}</span>
        <span className="text-xs text-muted-foreground">/{goal}{unit}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  );
};

export default DailyProgress;
