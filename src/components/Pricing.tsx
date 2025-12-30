import { motion } from "framer-motion";
import { Check, Sparkles, Crown } from "lucide-react";
import { Button } from "./ui/button";

const plans = [
  {
    name: "Free",
    description: "Perfect to try out",
    price: "₹0",
    priceUSD: "$0",
    period: "forever",
    features: [
      "5 food scans per day",
      "Basic calorie tracking",
      "7-day meal history",
      "Standard accuracy",
    ],
    cta: "Get Started",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Basic",
    description: "One-time purchase",
    price: "₹299",
    priceUSD: "$4.99",
    period: "lifetime",
    features: [
      "Unlimited food scans",
      "Full macro tracking",
      "7-day meal history",
      "Indian & Global foods",
      "Priority support",
    ],
    cta: "Buy Lifetime Access",
    variant: "gradient" as const,
    popular: true,
    badge: "Best Value",
  },
  {
    name: "Pro",
    description: "For serious users",
    price: "₹299",
    priceUSD: "$7.99",
    period: "/month",
    features: [
      "Everything in Basic",
      "Unlimited meal history",
      "Weekly & monthly reports",
      "PDF/Excel export",
      "Custom calorie goals",
      "Coach sharing dashboard",
      "Advanced analytics",
    ],
    cta: "Start Pro Trial",
    variant: "default" as const,
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-carbs/10 text-carbs text-sm font-medium mb-4">
            <Crown className="w-4 h-4" />
            Simple Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Choose Your <span className="gradient-text">Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when ready. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full gradient-primary text-primary-foreground text-sm font-medium shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className={`h-full flex flex-col rounded-2xl p-8 border transition-all duration-300 ${
                plan.popular 
                  ? 'bg-card shadow-xl shadow-primary/10 border-primary/30 ring-2 ring-primary/20' 
                  : 'bg-card hover:shadow-lg'
              }`}>
                {/* Plan header */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold font-display mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold font-display">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">or {plan.priceUSD} {plan.period !== "lifetime" ? plan.period : ""}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button variant={plan.variant} size="lg" className="w-full">
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badge */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          🔒 Secure payments via Razorpay (India) & Stripe (International)
        </motion.p>
      </div>
    </section>
  );
};

export default Pricing;