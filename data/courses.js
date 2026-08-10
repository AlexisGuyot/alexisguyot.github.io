/* ==========================================================================
   courses.js — Données des enseignements
   Modifier ce fichier suffit à mettre à jour la page Enseignement :
   aucun HTML à toucher. Chaque champ texte existe en FR et EN.
   ========================================================================== */
window.COURSES = [
  {
    id: "but2-r307-sql",
    title: { fr: "SQL dans un langage de programmation (R3.07)", en: "SQL within a programming language (R3.07)" },
    level: { fr: "BUT 2 — Informatique", en: "BUT 2 — Computer Science" },
    institution: { fr: "IUT d'Aix-en-Provence", en: "IUT of Aix-en-Provence" },
    desc: {
      fr: "Rappels de SQL et enseignement du langage procédural PL/(pg)SQL. Contraintes d'intégrité natives et définies par l'utilisateur (sous forme de triggers).",
      en: "Reminders of SQL and lessons on the procedural language PL/(pg)SQL. Native and user-defined integrity constraints (in the form of triggers).",
    },
    tags: ["Bases de données", "Relationnel", "PostgreSQL", "SQL", "PL/SQL", "PL/pgSQL", "Contraintes", "Triggers", "Databases", "Relational", "Constraints"],
    github: null,
    focus: null,
  },
  {
    id: "but2-r4al1-ia",
    title: { fr: "Introduction à l'intelligence artificielle (R4.A.L1)", en: "Introduction to artificial intelligence (R4.A.L1)" },
    level: { fr: "BUT 2 — Informatique", en: "BUT 2 — Computer Science" },
    institution: { fr: "IUT d'Aix-en-Provence", en: "IUT of Aix-en-Provence" },
    desc: {
      fr: "Fonctionnement, implémentation, entraînement et évaluation d'un réseau de neurones (PMC). Introduction à l'IA symbolique et au fonctionnement d'un moteur d'inférence logique (Prolog). Usages et limites (techniques, éthiques) de l'IA générative. Responsable de la ressource.",
      en: "Working principles, implementation, training and evaluation of a neural network (MLP). Introduction to symbolic AI and the workings of a logic inference engine (Prolog). Uses and limitations (technical and ethical) of generative AI. Module coordinator.",
    },
    tags: ["IA", "Machine Learning", "Réseaux de neurones", "IA symbolique", "IA générative", "Python", "PyTorch", "Scikit-Learn", "Prolog", "Neural Networks", "Symbolic AI", "Generative AI"],
    github: null,
    focus: {
      fr: "1 CM et 8h de TP sur la partie connexionniste, 1 CM et 6h sur la partie symbolique, un atelier de 2h sur la partie générative. L'atelier alterne des phases plus magistrales d'explications/sensibilisation et des phases de discussion et débats avec Wooclap comme support.",
      en: "1 lecture and 8 hours of practical work on the connectionist section, 1 lecture and 6 hours on the symbolic section, and a 2-hour workshop on the generative section. The workshop alternates between more lecture-style sessions focusing on explanations and raising awareness, and sessions of discussion and debate, using Wooclap as a medium.",
    },
  },
  {
    id: "but2-r403-relationnel",
    title: { fr: "Qualité relationnelle (R4.03)", en: "Relational quality (R4.03)" },
    level: { fr: "BUT 2 — Informatique", en: "BUT 2 — Computer Science" },
    institution: { fr: "IUT d'Aix-en-Provence", en: "IUT of Aix-en-Provence" },
    desc: {
      fr: "Extraction et usage des dépendances fonctionnelles pour le calcul de clés et la normalisation de relations.",
      en: "Extraction and use of functional dependencies for key calculation and relation normalisation.",
    },
    tags: ["Bases de données", "Relationnel", "Dépendances fonctionnelles", "Clés", "Normalisation", "Treillis", "SQLite", "Python", "Databases", "Relational", "Functional dependencies", "Keys", "Normalization", "Lattices"],
    github: null,
    focus: null,
  },
  {
    id: "but3-r403-prog-concurrente",
    title: { fr: "Programmation avancée (R5.A/B.05/04)", en: "Advanced programming (R5.A/B.05/04)" },
    level: { fr: "BUT 3 — Informatique", en: "BUT 3 — Computer Science" },
    institution: { fr: "IUT d'Aix-en-Provence", en: "IUT of Aix-en-Provence" },
    desc: {
      fr: "Threads, synchronisation (mutex, sémaphores), interblocages, mémoire partagée et programmation asynchrone en C++ moderne.",
      en: "Threads, synchronization (mutex, semaphores), deadlocks, shared memory and asynchronous programming in modern C++.",
    },
    tags: ["Algorithmique", "Programmation concurrente", "Threads", "Asynchrone", "Interblocages", "Sémaphores", "C++", "Algorithmics", "Concurrent programming", "Threads", "Asynchronous", "Deadlocks", "Semaphores"],
    github: null,
    focus: {
      fr: "Après un TD et quelques TP \"classiques\" sur machine, le module passe en pédagogie active par projet. Par groupes de 4 ou 5, les étudiants choisissent un problème classique de programmation concurrente (p.ex. problème du barbier), étudient ses fondements (concepts illustrés, caractéristiques fondamentales), conçoivent et implémentent une nouvelle variante du problème, puis restituent à l'oral ce qu'ils ont appris et le résultat de leur travail. Un usage responsable et documenté de l'IA est autorisé et même recommandé, sauf pour la génération de code.",
      en: "After a class and a few \'traditional\' practical sessions on computers, the module moves on to active, project-based learning. Working in groups of four or five, students choose a classic concurrent programming problem (e.g. the barber problem), study its fundamentals (illustrated concepts, fundamental characteristics), design and implement a new variant of the problem, and then give an oral presentation on what they have learnt and the results of their work. Responsible and well-documented use of AI is permitted and even recommended, except for code generation.",
    },
  },
  {
    id: "m1-dijon-algo",
    title: { fr: "Algorithmique et complexité", en: "Algorithmics and complexity" },
    level: { fr: "Master 1 — Informatique", en: "Master 1 — Computer Science" },
    institution: { fr: "UFR Sciences et Techniques, Dijon", en: "Faculty of Sciences and Techniques, Dijon" },
    desc: {
      fr: "Paradigmes de programmation avancés (fonctionnel, linéaire, logique) et analyse théorique des algorithmes classiques (tris, graphes, etc.). Programmation en OCaml.",
      en: "Advanced programming paradigms (functional, linear, logical) and theoretical analysis of classical algorithms (sorting, graphs, etc.). Programming in OCaml.",
    },
    tags: ["Algorithmique", "Complexité", "Programmation fonctionnelle", "OCaml", "Algorithmics", "Complexity", "Functional programming"],
    github: "https://github.com/AlexisGuyot/algocomplexite",
    focus: {
      fr: "Structuration classique en CM, TD, TP, projet. Le projet est un travail de groupe (par 2 ou 3) où les étudiants répondent à un problème donné (un par groupe) soit avec un algorihtme classique, soit avec un algorithme de leur conception. Une analyse critique, à la fois théorique et empirique, doit ensuite être proposée.",
      en: "The course follows a traditional structure comprising lectures, classwork and practical sessions, as well as a project. The project is a group assignment (in groups of two or three) in which students tackle a given problem (one per group) using either a standard algorithm or an algorithm of their own design. They must then present a critical analysis, covering both theoretical and empirical aspects."
    }
  },
  {
    id: "l2-dijon-algo",
    title: { fr: "Algorithmique avancée", en: "Advanced Algorithmics" },
    level: { fr: "Licence 2 — Informatique", en: "Bachelor 2 — Computer Science" },
    institution: { fr: "UFR Sciences et Techniques, Dijon", en: "Faculty of Sciences and Techniques, Dijon" },
    desc: {
      fr: "Introduction aux principales familles algorithmiques (tris, algorithmes sur les graphes, gloutons, etc.) et structures de données (tableaux, listes, piles, files, arbres, graphes), et aux notions de complexité algorithmique (en temps et en espace). Programmation procédurale et objet en Python.",
      en: "Introduction to the main families of algorithms (sorting, graph algorithms, greedy algorithms, etc.), data structures (arrays, lists, stacks, queues, trees, graphs), and concepts of algorithmic complexity (in terms of time and space). Procedural and object-oriented programming in Python.",
    },
    tags: ["Algorithmique", "Structures de données", "Complexité", "Programmation procédurale", "Programmation objet", "Python", "Algorithmics", "Data structures", "Complexity", "Procedural programming", "Object-oriented programming"],
    github: null,
    focus: null
  },
];
