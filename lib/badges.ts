export function awardBadges({
  existingBadges,
  stars,
  streak,
  correctAnswers,
}: {
  existingBadges: string[];
  stars: number;
  streak: number;
  correctAnswers: number;
}) {
  const badges = new Set(existingBadges);

  badges.add("Primo passo");

  if (stars >= 2) badges.add("Due stelle");
  if (stars === 3) badges.add("Tre stelle");
  if (correctAnswers >= 4) badges.add("Occhio matematico");
  if (streak >= 3) badges.add("Costanza 3 giorni");

  return Array.from(badges);
}
