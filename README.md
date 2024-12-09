# Math Learning Platform

Une plateforme d'apprentissage des mathématiques interactive et moderne, conçue pour faciliter l'apprentissage et l'évaluation des élèves.

## Fonctionnalités

### Pour les Élèves
- **Compte Personnel**: Création de compte avec niveau scolaire (TRC, 1BAC, 2BAC)
- **Tableau de Bord**: Suivi des progrès et statistiques personnalisées
- **Quiz Interactifs**: Tests de connaissances avec différents types de questions
- **Exercices Pratiques**: Exercices de mathématiques structurés par niveau
- **Support des Expressions Mathématiques**: Affichage correct des formules avec KaTeX

### Pour les Administrateurs
- **Accès Sécurisé**: Code d'accès unique (0000)
- **Gestion des Quiz**:
  - Création de quiz avec trois types de questions:
    - Vrai/Faux
    - Choix multiples
    - Questions à trous
  - Support des expressions mathématiques (entre $ $)
  - Aperçu en temps réel
  - Organisation par niveau et leçon

- **Gestion des Exercices**:
  - Création d'exercices structurés
  - Questions principales et sous-questions
  - Support des expressions mathématiques
  - Mise en page professionnelle

- **Suivi des Élèves**:
  - Liste des élèves inscrits
  - Statistiques de progression
  - Taux de réussite
  - Temps de complétion

## Guide d'Utilisation

### Pour les Élèves
1. Créez un compte en fournissant:
   - Nom et prénom
   - Email
   - Niveau scolaire
   - Mot de passe

2. Connectez-vous à votre espace personnel
3. Accédez aux quiz et exercices disponibles
4. Suivez votre progression dans le tableau de bord

### Pour les Administrateurs
1. Accédez à l'interface admin via l'icône en bas de page
2. Connectez-vous avec le code: 0000
3. Gérez les contenus pédagogiques:
   - Création et édition de quiz
   - Création et édition d'exercices
   - Suivi des élèves

## Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev
```

## Structure du Projet

```
src/
├── components/
│   ├── auth/         # Composants d'authentification
│   ├── dashboard/    # Composants du tableau de bord
│   ├── quiz/         # Gestion des quiz
│   ├── exercise/     # Gestion des exercices
│   ├── student/      # Interface étudiant
│   └── shared/       # Composants partagés
├── lib/             # Logique métier et utilitaires
├── pages/           # Pages principales
└── types/           # Définitions TypeScript
```

## Technologies Utilisées

- **Frontend**: React avec TypeScript
- **Styles**: Tailwind CSS
- **Math**: KaTeX pour le rendu des expressions mathématiques
- **Storage**: IndexedDB pour le stockage local
- **Build**: Vite pour le développement et la production

## Sécurité

- Authentification séparée pour les élèves et administrateurs
- Stockage sécurisé des données utilisateur
- Validation des entrées utilisateur
- Protection des routes administratives

## Contribution

1. Fork du projet
2. Création d'une branche (`git checkout -b feature/amelioration`)
3. Commit des changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Création d'une Pull Request

## License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.