export interface TrendingSearch {
  label: string;
  query: string;
}

const ALL_TRENDING: TrendingSearch[] = [
  { label: "Birria tacos", query: "birria tacos recipe" },
  { label: "Baked oats", query: "baked oats recipe" },
  { label: "Butter chicken", query: "butter chicken recipe" },
  { label: "Sourdough bread", query: "sourdough bread recipe" },
  { label: "Protein bowl", query: "high protein bowl recipe" },
  { label: "Pasta aglio e olio", query: "pasta aglio e olio recipe" },
  { label: "Korean fried chicken", query: "korean fried chicken recipe" },
  { label: "Banana bread", query: "banana bread recipe" },
  { label: "Shakshuka", query: "shakshuka recipe" },
  { label: "Pho", query: "vietnamese pho recipe" },
  { label: "Cinnamon rolls", query: "cinnamon rolls recipe" },
  { label: "Chicken tikka", query: "chicken tikka recipe" },
  { label: "Crème brûlée", query: "creme brulee recipe" },
  { label: "Pad thai", query: "pad thai recipe" },
  { label: "Avocado toast", query: "avocado toast recipe" },
];

export function getRandomTrending(count: number = 6): TrendingSearch[] {
  const shuffled = [...ALL_TRENDING].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
