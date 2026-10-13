import { Apple, Dumbbell, FlaskConical, Leaf, Pill, Sparkles, Zap, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  proteins: Dumbbell,
  creatine: FlaskConical,
  "pre-workout": Zap,
  bcaas: Leaf,
  vitamins: Pill,
  accessories: Sparkles,
};

export function CategoryIcon({ slug, className = "size-6" }: { slug: string; className?: string }) {
  const Icon = icons[slug] ?? Apple;
  return <Icon className={className} strokeWidth={1.6} />;
}
