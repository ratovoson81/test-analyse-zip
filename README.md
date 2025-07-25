# 📁 Test analyse zip

Cette application Node.js permet d'uploader un fichier `.zip` contenant plusieurs documents administratifs au format PDF, d’en extraire automatiquement le contenu, et de vérifier la présence ainsi que la validité des documents.

---

## 🚀 Fonctionnalités

- 📦 Upload d’un fichier `.zip` contenant des documents PDF.
- 📂 Extraction automatique des fichiers ZIP.
- 📄 Analyse du texte des fichiers PDF avec détection de date de validité.
- 🧠 Vérification des documents requis.
- ⏱️ Détection de documents expirés ou manquants.

---

## ⚙️ Installation

### Prérequis

- Node.js >= 16.x
- npm

### Étapes

```bash
# 1. Cloner le repo
git clone https://github.com/ratovoson81/test-analyse-zip
cd test-analyse-zip

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur
node server.js
```
