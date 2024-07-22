type ProblemDetails = {
  title: string;
  difficulty: string;
  routePath: string;
};

export const problemSet: ProblemDetails[] = [
  {
    title: "Sum of Numbers",
    difficulty: "Easy",
    routePath: "/problemset/sum-of-numbers",
  },
  {
    title: "Maximum Number",
    difficulty: "Medium",
    routePath: "/problemset/maximum-number",
  },
  {
    title: "Sort Numbers",
    difficulty: "Difficult",
    routePath: "/problemset/sort-numbers",
  },
];
