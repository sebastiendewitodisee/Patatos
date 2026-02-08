export const PLANNING_SEASON = "Saison 2026 (Belgique)";

export const STATUS_META = {
  todo: { label: "À faire", tone: "todo" },
  doing: { label: "En cours", tone: "progress" },
  done: { label: "Fait", tone: "done" },
};

export const STATUS_OPTIONS = [
  { value: "all", label: "Tous" },
  { value: "todo", label: "À faire" },
  { value: "doing", label: "En cours" },
  { value: "done", label: "Fait" },
];

export const TYPE_META = {
  preparation: { label: "Préparation", tone: "preparation" },
  plantation: { label: "Plantation", tone: "plantation" },
  suivi: { label: "Suivi", tone: "suivi" },
  recolte: { label: "Récolte", tone: "recolte" },
  conservation: { label: "Conservation", tone: "conservation" },
};

export const PHASE_ORDER = ["Préparation", "Plantation", "Suivi", "Récolte", "Conservation"];

// Source unique à éditer pour faire évoluer le planning.
export const planningEvents = [
  {
    id: "preparation-terrain",
    order: 1,
    period: "Février–Mars 2026",
    updatedAt: "2026-02-08",
    title: "Préparation du terrain",
    type: "preparation",
    status: "done",
    phase: "Préparation",
    description: "Zone nettoyée, sol ameubli et zones de plantation repérées.",
    responsibles: ["Denis", "Sébastien \"le vrai\""],
  },
  {
    id: "achat-tri-plants",
    order: 2,
    period: "Mars 2026 (indicatif)",
    updatedAt: "2026-02-08",
    title: "Achat / tri des plants",
    type: "preparation",
    status: "doing",
    phase: "Préparation",
    isIndicative: true,
    description: "Comparer les lots disponibles, retirer les plants fragiles et finaliser la liste des variétés.",
    responsibles: ["Melvin", "Josh"],
  },
  {
    id: "plantation-weekend",
    order: 3,
    period: "Mars–Avril 2026 (indicatif)",
    updatedAt: "2026-02-08",
    title: "Plantation (session weekend)",
    type: "plantation",
    status: "todo",
    phase: "Plantation",
    isIndicative: true,
    description: "Session collective pour mise en terre, espacement des rangs et premier arrosage.",
    responsibles: ["Toute la team"],
  },
  {
    id: "buttage-1",
    order: 4,
    period: "Avril–Mai 2026 (indicatif)",
    updatedAt: "2026-02-08",
    title: "Buttage 1",
    type: "suivi",
    status: "todo",
    phase: "Suivi",
    isIndicative: true,
    description: "Ramener la terre au pied des plants pour protéger les tubercules et soutenir la pousse.",
    responsibles: ["Sébastien", "Jayden"],
  },
  {
    id: "controle-maladies-arrosage",
    order: 5,
    period: "Mai–Août 2026 (indicatif)",
    updatedAt: "2026-02-08",
    title: "Contrôle maladies + arrosage",
    type: "suivi",
    status: "todo",
    phase: "Suivi",
    isIndicative: true,
    description: "Surveiller le feuillage, ajuster l'arrosage et signaler rapidement les signes suspects.",
    responsibles: ["Emma", "Matteo", "Eva"],
  },
  {
    id: "recolte-precoces-indicatif",
    order: 6,
    period: "Juin–Juillet 2026 (indicatif)",
    updatedAt: "2026-02-08",
    title: "Récolte précoces (indicatif)",
    type: "recolte",
    status: "todo",
    phase: "Récolte",
    isIndicative: true,
    description: "Premiers tests de récolte sur quelques pieds pour valider la maturité.",
    responsibles: ["À définir"],
  },
  {
    id: "recolte-conservation-indicatif",
    order: 7,
    period: "Septembre–Octobre 2026 (indicatif)",
    updatedAt: "2026-02-08",
    title: "Récolte conservation (indicatif)",
    type: "conservation",
    status: "todo",
    phase: "Conservation",
    isIndicative: true,
    description: "Récolte principale puis tri et stockage en zone fraîche, sèche et sombre.",
    responsibles: ["À définir"],
  },
];
