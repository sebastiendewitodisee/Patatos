export const projectData = {
  badge: 'Page infos projet',
  title: 'Team Patates Patatos',
  subtitle:
    'Une page simple pour suivre notre avancée à 5 et garder les actions utiles au même endroit.',
  sections: {
    statusTitle: 'Statut actuel',
    nextActionTitle: 'Prochaine action',
    todoTitle: 'A faire maintenant',
    timelineTitle: 'Timeline complete achat -> recolte',
    objectiveLabel: 'Objectif',
    checklistLabel: 'Checklist',
    germinationTitle: 'Germination (mode d emploi)',
    alertsTitle: 'Signes d alerte',
    notesTitle: 'Notes',
  },
  currentStatus: {
    currentStep: 'Etape en cours: choix des pommes de terre + preparation du coin germination.',
    nextAction:
      'Valider aujourd hui un endroit lumineux et frais, puis poser les tubercules sur clayettes en une seule couche.',
  },
  todoNow: [
    'Trouver un endroit clair (sans soleil direct) pour faire germer.',
    'Organiser un espace propre avec circulation d air.',
    'Choisir des tubercules fermes, sans taches ni moisissure.',
    'Repartir les roles de suivi entre les 5 membres.',
    'Fixer la date cible de plantation selon la meteo locale.',
  ],
  timeline: [
    {
      step: 'Achat',
      objective: 'Selectionner des plants sains et adaptes a notre periode de culture.',
      checklist: [
        'Comparer 2 a 3 varietes selon rendement et gout.',
        'Verifier la fermete et l absence de blessures.',
        'Prevoir un petit surplus en cas de pertes.',
      ],
    },
    {
      step: 'Germination',
      objective: 'Obtenir des germes courts, trapus et reguliers avant plantation.',
      checklist: [
        'Poser les tubercules a plat, yeux vers le haut.',
        'Maintenir un espace lumineux et ventile.',
        'Tourner les clayettes tous les 3-4 jours.',
      ],
    },
    {
      step: 'Preparation sol',
      objective: 'Avoir un sol meuble, fertile et bien draine.',
      checklist: [
        'Desherber et retirer les cailloux.',
        'Incorporer compost mur et matiere organique.',
        'Tracer les lignes de plantation avec ecartement regulier.',
      ],
    },
    {
      step: 'Plantation',
      objective: 'Planter au bon moment et a la bonne profondeur.',
      checklist: [
        'Planter quand le risque de gel fort est passe.',
        'Respecter les distances entre plants et rangs.',
        'Arroser legerement apres mise en terre.',
      ],
    },
    {
      step: 'Entretien',
      objective: 'Soutenir la croissance jusqu a maturite sans stress hydrique.',
      checklist: [
        'Buter les plants au fur et a mesure de la pousse.',
        'Arroser regulierement sans detremper.',
        'Surveiller doryphores, mildiou et feuilles abimees.',
      ],
    },
    {
      step: 'Recolte',
      objective: 'Recolter au bon stade avec un minimum de pertes.',
      checklist: [
        'Attendre le jaunissement du feuillage selon usage.',
        'Sortir les tubercules par temps sec.',
        'Ecarter les patates blessees pour usage rapide.',
      ],
    },
    {
      step: 'Stockage/partage',
      objective: 'Conserver durablement et partager proprement les recoltes.',
      checklist: [
        'Laisser ressuyer avant stockage.',
        'Stocker au frais, a l obscurite, dans des cagettes aerées.',
        'Repartir les lots et noter les retours de l equipe.',
      ],
    },
  ],
  germination: {
    guidance: [
      {
        label: 'Lumiere',
        content: 'Lumiere indirecte 8 a 10 h/jour pour eviter des germes filants.',
      },
      {
        label: 'Temperature',
        content: 'Idealement entre 10 et 15 C pour une croissance lente et solide.',
      },
      {
        label: 'Ventilation',
        content: 'Air circulant, sans humidite stagnante, pour limiter les pourritures.',
      },
    ],
    alerts: [
      'Germes longs et pales: manque de lumiere.',
      'Tubercules mous: exces de chaleur ou humidite.',
      'Odeur forte ou taches noires: retirer immediatement les plants touches.',
    ],
  },
  notes: {
    inputPlaceholder: 'Ajouter une note rapide pour l equipe...',
    buttonLabel: 'Ajouter',
    initialNotes: [
      'Verifier qui amene les clayettes de germination.',
      'Confirmer le week-end de preparation du sol.',
    ],
  },
}
