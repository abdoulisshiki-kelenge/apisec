const characters = [
  { name: 'Naruto Uzumaki', role: 'Le ninja imprévisible', village: 'Konoha', tags: ['Konoha', 'Équipe 7', 'Légendes'], symbol: 'うずまき', emoji: '🍥', color: 'orange', quote: 'Je ne reviens jamais sur ma parole.', number: '07' },
  { name: 'Sasuke Uchiha', role: 'Le dernier héritier', village: 'Konoha', tags: ['Konoha', 'Équipe 7'], symbol: 'うちは', emoji: '⚡', color: 'blue', quote: 'Je trace mon propre chemin.', number: '02' },
  { name: 'Sakura Haruno', role: 'La force de la volonté', village: 'Konoha', tags: ['Konoha', 'Équipe 7'], symbol: '春野', emoji: '🌸', color: 'pink', quote: 'Je ne serai plus un poids.', number: '03' },
  { name: 'Kakashi Hatake', role: 'Le ninja copieur', village: 'Konoha', tags: ['Konoha', 'Équipe 7', 'Légendes'], symbol: 'はたけ', emoji: '🐺', color: 'silver', quote: 'Ceux qui abandonnent sont pires que tout.', number: '06' },
  { name: 'Hinata Hyuga', role: 'La douce détermination', village: 'Konoha', tags: ['Konoha'], symbol: '日向', emoji: '🌙', color: 'lilac', quote: 'Je veux marcher à tes côtés.', number: '08' },
  { name: 'Shikamaru Nara', role: 'Le stratège de l’ombre', village: 'Konoha', tags: ['Konoha'], symbol: '奈良', emoji: '♟️', color: 'green', quote: 'Quelle galère… mais j’y vais.', number: '10' },
  { name: 'Gaara', role: 'Le Kazekage', village: 'Suna', tags: ['Légendes'], symbol: '砂', emoji: '🏜️', color: 'red', quote: 'Je me bats pour ceux qui me sont chers.', number: '05' },
  { name: 'Jiraiya', role: 'L’ermite des crapauds', village: 'Konoha', tags: ['Konoha', 'Légendes'], symbol: '自来也', emoji: '🐸', color: 'cream', quote: 'La vie d’un ninja se mesure à sa façon de mourir.', number: '09' },
  { name: 'Itachi Uchiha', role: 'L’ombre du clan', village: 'Konoha', tags: ['Konoha', 'Légendes'], symbol: '暁', emoji: '🌑', color: 'dark', quote: 'La connaissance et la conscience sont vagues.', number: '01' },
];

const grid = document.querySelector('#character-grid');
const empty = document.querySelector('#empty-state');
const search = document.querySelector('#search');
let activeFilter = 'Tous';

function renderCharacters() {
  const query = search.value.trim().toLocaleLowerCase('fr');
  const filtered = characters.filter((character) => {
    const matchesFilter = activeFilter === 'Tous' || character.tags.includes(activeFilter);
    return matchesFilter && `${character.name} ${character.role} ${character.village}`.toLocaleLowerCase('fr').includes(query);
  });
  grid.replaceChildren(...filtered.map((character, index) => {
    const card = document.createElement('article');
    card.className = 'character-card';
    card.style.setProperty('--delay', `${index * 55}ms`);

    const portrait = document.createElement('div');
    portrait.className = `portrait ${character.color}`;
    portrait.setAttribute('aria-label', `Illustration typographique de ${character.name}`);
    const number = document.createElement('span');
    number.className = 'card-number';
    number.textContent = character.number;
    const seal = document.createElement('span');
    seal.className = 'portrait-seal';
    seal.textContent = character.symbol;
    const emoji = document.createElement('span');
    emoji.className = 'portrait-emoji';
    emoji.textContent = character.emoji;
    const village = document.createElement('span');
    village.className = 'portrait-village';
    village.textContent = character.village.toUpperCase();
    portrait.append(number, seal, emoji, village);

    const details = document.createElement('div');
    details.className = 'card-details';
    const copy = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = character.name;
    const role = document.createElement('p');
    role.textContent = character.role;
    copy.append(title, role);
    const arrow = document.createElement('span');
    arrow.className = 'card-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    details.append(copy, arrow);

    const quote = document.createElement('p');
    quote.className = 'card-quote';
    quote.textContent = `“${character.quote}”`;
    card.append(portrait, details, quote);
    return card;
  }));
  empty.hidden = filtered.length !== 0;
}

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === button));
    renderCharacters();
  });
});
search.addEventListener('input', renderCharacters);
renderCharacters();

const dialog = document.querySelector('#auth-dialog');
const authForm = document.querySelector('#auth-form');
const message = document.querySelector('#form-message');
const usernameField = document.querySelector('#username-field');
const submitButton = authForm.querySelector('button[type="submit"]');
const accountPanel = document.querySelector('#account-panel');
let authMode = 'register';

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('error', isError);
}
function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll('.auth-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.mode === mode));
  usernameField.hidden = mode === 'login';
  usernameField.querySelector('input').required = mode === 'register';
  authForm.elements.password.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  submitButton.firstChild.textContent = mode === 'login' ? 'Se connecter ' : 'Créer mon compte ';
  showMessage('');
}
document.querySelectorAll('.auth-tab').forEach((tab) => tab.addEventListener('click', () => setAuthMode(tab.dataset.mode)));
document.querySelector('#open-auth').addEventListener('click', () => {
  const token = sessionStorage.getItem('konoha-token');
  authForm.hidden = Boolean(token);
  document.querySelector('.auth-tabs').hidden = Boolean(token);
  document.querySelector('#auth-title').textContent = token ? 'Bienvenue, shinobi' : 'Espace ninja';
  accountPanel.hidden = !token;
  if (token) loadProfile();
  dialog.showModal();
});
document.querySelector('#logout-button').addEventListener('click', () => {
  sessionStorage.removeItem('konoha-token');
  accountPanel.hidden = true;
  authForm.hidden = false;
  document.querySelector('.auth-tabs').hidden = false;
  document.querySelector('#auth-title').textContent = 'Espace ninja';
  showMessage('Tu es déconnecté.');
});

async function loadProfile() {
  try {
    const response = await fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('konoha-token')}` },
    });
    if (!response.ok) throw new Error('Session expirée. Reconnecte-toi.');
    const profile = await response.json();
    document.querySelector('#account-greeting').textContent = `Connecté·e en tant que ${profile.username}`;
  } catch (error) {
    document.querySelector('#account-greeting').textContent = error.message;
  }
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!authForm.reportValidity()) return;
  const form = new FormData(authForm);
  const payload = { email: String(form.get('email')).trim(), password: String(form.get('password')) };
  if (authMode === 'register') payload.username = String(form.get('username')).trim();
  const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
  submitButton.disabled = true;
  showMessage('Connexion au village…');
  try {
    const response = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(Array.isArray(data.detail) ? 'Vérifie les informations saisies.' : data.detail || 'Une erreur est survenue.');
    if (authMode === 'login') {
      sessionStorage.setItem('konoha-token', data.access_token);
      authForm.hidden = true;
      document.querySelector('.auth-tabs').hidden = true;
      accountPanel.hidden = false;
      document.querySelector('#auth-title').textContent = 'Bienvenue, shinobi';
      await loadProfile();
    } else {
      showMessage('Compte créé ! Tu peux maintenant te connecter.');
      setAuthMode('login');
      authForm.elements.email.value = payload.email;
      authForm.elements.password.value = '';
    }
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    submitButton.disabled = false;
  }
});
