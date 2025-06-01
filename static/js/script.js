let collection = [];
let searchQuery = "";
let selectedRarity = "";
let selectedSort = "dex";
let currentPage = 1;
const cardsPerPage = 20;

fetch('/api/cards')
  .then(res => res.json())
  .then(data => {
    collection = data;
    loadOwnershipFromStorage();
    filterAndRender();
  });

const cardGrid = document.getElementById('cardGrid');
const modal = document.getElementById('modal');
const modalName = document.getElementById('modalName');
const modalImage = document.getElementById('modalImage');
const modalDetails = document.getElementById('modalDetails');
const modalSet = document.getElementById('modalSet');
const modalRarity = document.getElementById('modalRarity');
const pagination = document.getElementById('pagination');

function openModal(card) {
  modalName.textContent = card.name;
  modalImage.src = card.owned && card.image ? card.image : '/static/images/questionmark.png';
  modalDetails.textContent = card.owned && card.description
    ? card.description
    : "You haven't collected this card yet.";

  modalSet.textContent = `Set: ${card.set}`;
  modalRarity.textContent = `Rarity: ${card.rarity}`;

  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

function loadOwnershipFromStorage() {
  const stored = JSON.parse(localStorage.getItem('ownedCards') || '{}');
  collection.forEach(card => {
    if (stored[card.name] !== undefined) {
      card.owned = stored[card.name];
    }
  });
}

function toggleOwned(cardName) {
  const card = collection.find(c => c.name === cardName);
  if (card) {
    card.owned = !card.owned;
    const stored = JSON.parse(localStorage.getItem('ownedCards') || '{}');
    stored[card.name] = card.owned;
    localStorage.setItem('ownedCards', JSON.stringify(stored));
    filterAndRender();
  }
}

const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const rarityFilter = document.getElementById('rarityFilter');

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.toLowerCase();
  currentPage = 1;
  filterAndRender();
});

sortSelect.addEventListener('change', (e) => {
  selectedSort = e.target.value;
  currentPage = 1;
  filterAndRender();
});

rarityFilter.addEventListener('change', (e) => {
  selectedRarity = e.target.value;
  currentPage = 1;
  filterAndRender();
});

function filterAndRender() {
  let filtered = collection;

  if (selectedRarity) {
    filtered = filtered.filter(card => card.rarity === selectedRarity);
  }

  if (searchQuery) {
    filtered = filtered.filter(card =>
      card.name.toLowerCase().includes(searchQuery) ||
      card.type.toLowerCase().includes(searchQuery) ||
      card.set.toLowerCase().includes(searchQuery)
    );
  }

  if (selectedSort === 'dex') {
    filtered.sort((a, b) => a.dex - b.dex);
  } else if (selectedSort === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderPaginatedCards(filtered);
}

function renderPaginatedCards(cards) {
  const start = (currentPage - 1) * cardsPerPage;
  const end = start + cardsPerPage;
  const paginated = cards.slice(start, end);

  renderCards(paginated);
  renderPaginationControls(cards.length);
}

function renderPaginationControls(totalCards) {
  pagination.innerHTML = '';
  const totalPages = Math.ceil(totalCards / cardsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      filterAndRender();
    });
    pagination.appendChild(btn);
  }
}

function renderCards(cards) {
  cardGrid.innerHTML = '';
  cards.forEach(card => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${card.owned && card.image ? card.image : '/static/images/questionmark.png'}" alt="${card.name}">
      <h3>#${card.dex} ${card.name}</h3>
      <p>${card.type}</p>
    `;
    div.addEventListener('click', () => openModal(card));
    cardGrid.appendChild(div);
  });
}
