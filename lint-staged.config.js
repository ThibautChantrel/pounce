module.exports = {
  // On utilise 'eslint --fix' directement.
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],

  // Pour les autres fichiers
  '*.{json,css,md,yml}': ['prettier --write'],
}
