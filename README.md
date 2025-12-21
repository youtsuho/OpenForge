<div align="center">
  <br />
  <p>
    <img src="https://discord.js.org/static/logo.svg" width="546" alt="OpenForge Logo" />
  </p>
  <h1>OpenForge</h1>
  <p><strong>Le bot Discord forgé par la communauté.</strong></p>
</div>

> [!CAUTION]
> **OpenForge est un projet communautaire en évolution continue.**
>  
> Les fonctionnalités peuvent évoluer, être modifiées ou supprimées en fonction des contributions acceptées.
>  
> Merci de lire attentivement le fichier [CONTRIBUTING.md](./CONTRIBUTING.md) avant de proposer un Pull Request.

---

## 🌐 À propos

**OpenForge** est un bot Discord **open source** et **collaboratif**, développé en **Node.js** avec la librairie **discord.js**.

Son objectif est clair : créer un bot qui évolue **grâce à la communauté**, où chaque développeur peut proposer des commandes, améliorer l’existant et participer activement à un projet public et transparent.

OpenForge se veut être :
- un terrain d’apprentissage,
- un projet collectif,
- un bot modulaire et extensible.

Chaque fonctionnalité intégrée est le fruit d’une contribution validée.

---

<div align="center">
  <p>
    <a href="https://github.com/youtsuho/OpenForge">
      <img src="https://img.shields.io/github/stars/youtsuho/OpenForge?style=flat-square" alt="GitHub stars" />
    </a>
    <a href="./LICENSE">
      <img src="https://img.shields.io/github/license/youtsuho/OpenForge?style=flat-square" alt="License MIT" />
    </a>
  </p>
  <h3>
    <a href="https://discord.com/oauth2/authorize?client_id=1449792004128116857">🚀 Ajouter OpenForge à votre serveur</a>
  </h3>
</div>

> [!IMPORTANT]
> **OpenForge est exclusivement destiné à une utilisation avec des comptes BOT.**
>  
> L’utilisation de tokens utilisateurs (selfbot) est strictement interdite par les Conditions d’Utilisation de Discord.

---

## ✨ Fonctionnalités actuelles

- [x] Commande `/ping` — Latence
- [x] Système de Bienvenue SQL — Entièrement personnalisable via `/welcome-config`
- [x] Constructeur d'Embed — `/embed-builder`
- [x] Commandes de Modération — `/clear`, `/ban`, `/lock`, `/unlock`, `/normalize`
- [x] Utilitaires — `/avatar`, `/info`, `/poll`, `/remind`, `/say`, `/help`
- [x] Fun — `/couple`

---

## ⚙️ Installation

> [!NOTE]
> **Node.js 20.x ou plus récent est requis**

### 1️⃣ Cloner le dépôt

```sh
git clone https://github.com/youtsuho/OpenForge.git
cd OpenForge
npm install
````

### 2️⃣ Configuration

Créez un fichier `.env` à la racine du projet et complétez les informations :

```env
DISCORD_TOKEN=VOTRE_TOKEN_BOT

# Configuration Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_DATABASE=openforge
```

> [!CAUTION]
> Le fichier `.env` est ignoré par Git.
> **Ne partagez jamais vos accès SQL ou votre token Discord.**

### 3️⃣ Lancer le bot

```sh
node bot.js
# ou
npm run dev
```

---

## 🤝 Contribution

OpenForge vit grâce à sa communauté.

📄 Toutes les contributions sont publiées sous **Licence MIT**.

---

## 💖 Crédits

Merci à tous les contributeurs qui participent à faire évoluer **OpenForge**.
**Forgeons l’avenir, ensemble.**
