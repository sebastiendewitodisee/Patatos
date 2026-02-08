export const STATUS_META = {
  "a-faire": { label: "À faire", tone: "todo" },
  "en-cours": { label: "En cours", tone: "progress" },
  fait: { label: "Fait", tone: "done" },
};

export const STATUS_OPTIONS = [
  { value: "all", label: "Tous" },
  { value: "a-faire", label: "À faire" },
  { value: "en-cours", label: "En cours" },
  { value: "fait", label: "Fait" },
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
    date: "2026-02-01",
    updatedAt: "2026-02-06",
    title: "Préparation du terrain",
    type: "preparation",
    status: "fait",
    phase: "Préparation",
    description: "Nettoyage de la zone, apport de matière organique et plan de zones de plantation.",
    responsibles: ["Denis", "Sébastien \"le vrai\""],
  },
  {
    id: "achat-tri-plants",
    date: "2026-02-15",
    updatedAt: "2026-02-08",
    title: "Achat / tri des plants",
    type: "preparation",
    status: "en-cours",
    phase: "Préparation",
    description: "Comparer les lots disponibles et trier les plants les plus sains.",
    responsibles: ["Melvin", "Josh"],
  },
  {
    id: "plantation-weekend",
    date: "2026-03-14",
    updatedAt: "2026-02-08",
    title: "Plantation (session weekend)",
    type: "plantation",
    status: "a-faire",
    phase: "Plantation",
    description: "Session collective pour mise en terre, alignement des rangs et premier arrosage.",
    responsibles: ["Toute la team"],
  },
  {
    id: "buttage-1",
    date: "2026-04-18",
    updatedAt: "2026-02-08",
    title: "Buttage 1",
    type: "suivi",
    status: "a-faire",
    phase: "Suivi",
    description: "Remonter la terre autour des pieds pour protéger les tubercules et soutenir la croissance.",
    responsibles: ["Sébastien", "Jayden"],
  },
  {
    id: "controle-maladies-arrosage",
    date: "2026-05-09",
    updatedAt: "2026-02-08",
    title: "Contrôle maladies + arrosage",
    type: "suivi",
    status: "a-faire",
    phase: "Suivi",
    description: "Vérification visuelle des feuilles, humidité du sol et ajustement des arrosages.",
    responsibles: ["Emma", "Matteo", "Eva"],
  },
  {
    id: "recolte-precoces-indicatif",
    date: "2026-06-27",
    updatedAt: "2026-02-08",
    title: "Récolte précoces (indicatif)",
    type: "recolte",
    status: "a-faire",
    phase: "Récolte",
    description: "Fenêtre de récolte estimée pour les précoces. À ajuster selon observation réelle.",
    responsibles: ["À définir"],
  },
  {
    id: "recolte-conservation-indicatif",
    date: "2026-09-19",
    updatedAt: "2026-02-08",
    title: "Récolte conservation (indicatif)",
    type: "conservation",
    status: "a-faire",
    phase: "Conservation",
    description: "Récolte principale des variétés de conservation puis tri et mise en stockage.",
    responsibles: ["À définir"],
  },
];
