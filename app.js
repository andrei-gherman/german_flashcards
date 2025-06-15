// German Vocabulary Flashcard App
class FlashcardApp {
    constructor() {
        this.decks = new Map();
        this.currentDeck = null;
        this.currentStudySession = null;
        this.currentScreen = 'main-screen';
        
        // Initialize with sample data
        this.initializeSampleData();
        this.initializeEventListeners();
        this.updateDeckList();
    }

    initializeSampleData() {
        const sampleDeck = {
            id: 'sample_deck_1',
            name: 'Basic German',
            cards: [
                {
                    id: 'card_1',
                    german: 'Hallo',
                    english: 'Hello',
                    interval: 1,
                    repetition: 0,
                    easeFactor: 2.5,
                    dueDate: Date.now(),
                    lastReview: null
                },
                {
                    id: 'card_2',
                    german: 'Danke',
                    english: 'Thank you',
                    interval: 1,
                    repetition: 0,
                    easeFactor: 2.5,
                    dueDate: Date.now(),
                    lastReview: null
                },
                {
                    id: 'card_3',
                    german: 'Guten Morgen',
                    english: 'Good morning',
                    interval: 1,
                    repetition: 0,
                    easeFactor: 2.5,
                    dueDate: Date.now(),
                    lastReview: null
                }
            ]
        };
        
        this.decks.set(sampleDeck.id, sampleDeck);
    }

    initializeEventListeners() {
        // Navigation buttons
        document.getElementById('create-deck-btn').addEventListener('click', () => this.showScreen('create-deck-screen'));
        document.getElementById('import-apkg-btn').addEventListener('click', () => this.showScreen('import-screen'));
        
        // Back buttons
        document.getElementById('back-to-main').addEventListener('click', () => this.showScreen('main-screen'));
        document.getElementById('back-to-main-import').addEventListener('click', () => this.showScreen('main-screen'));
        document.getElementById('back-to-main-deck').addEventListener('click', () => this.showScreen('main-screen'));
        document.getElementById('back-to-deck').addEventListener('click', () => this.showDeckScreen(this.currentDeck.id));
        
        // Deck creation
        document.getElementById('save-deck-btn').addEventListener('click', () => this.createDeck());
        
        // Card management
        document.getElementById('add-card-btn').addEventListener('click', () => this.showScreen('add-card-screen'));
        document.getElementById('save-card-btn').addEventListener('click', () => this.addCard());
        document.getElementById('export-deck-btn').addEventListener('click', () => this.exportDeck());
        
        // Study session
        document.getElementById('start-study-btn').addEventListener('click', () => this.startStudySession());
        document.getElementById('end-study-btn').addEventListener('click', () => this.endStudySession());
        document.getElementById('flip-card-btn').addEventListener('click', () => this.flipCard());
        
        // Response buttons
        document.querySelectorAll('.response-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleResponse(e.target.dataset.response));
        });
        
        // File import
        document.getElementById('apkg-file').addEventListener('change', (e) => this.handleApkgImport(e));
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
        
        if (screenId === 'main-screen') {
            this.updateDeckList();
        }
    }

    updateDeckList() {
        const deckList = document.getElementById('deck-list');
        deckList.innerHTML = '';
        
        if (this.decks.size === 0) {
            deckList.innerHTML = '<p class="text-center">No decks available. Create a new deck or import an .apkg file.</p>';
            return;
        }
        
        this.decks.forEach(deck => {
            const deckElement = this.createDeckElement(deck);
            deckList.appendChild(deckElement);
        });
    }

    createDeckElement(deck) {
        const dueCards = deck.cards.filter(card => card.dueDate <= Date.now()).length;
        const totalCards = deck.cards.length;
        const progress = totalCards > 0 ? ((totalCards - dueCards) / totalCards) * 100 : 0;
        
        const deckDiv = document.createElement('div');
        deckDiv.className = 'deck-item';
        deckDiv.innerHTML = `
            <div class="deck-item-header">
                <h3 class="deck-name">${deck.name}</h3>
                <div class="deck-stats-inline">
                    <span>${totalCards} cards</span>
                    <span>${dueCards} due</span>
                </div>
            </div>
            <div class="deck-progress">
                <div class="deck-progress-fill" style="width: ${progress}%"></div>
            </div>
        `;
        
        deckDiv.addEventListener('click', () => this.showDeckScreen(deck.id));
        return deckDiv;
    }

    showDeckScreen(deckId) {
        this.currentDeck = this.decks.get(deckId);
        if (!this.currentDeck) return;
        
        document.getElementById('deck-title').textContent = this.currentDeck.name;
        document.getElementById('total-cards').textContent = this.currentDeck.cards.length;
        document.getElementById('due-cards').textContent = 
            this.currentDeck.cards.filter(card => card.dueDate <= Date.now()).length;
        
        this.updateCardList();
        this.showScreen('deck-screen');
    }

    updateCardList() {
        const cardList = document.getElementById('card-list');
        cardList.innerHTML = '';
        
        this.currentDeck.cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            cardList.appendChild(cardElement);
        });
    }

    createCardElement(card) {
        const now = Date.now();
        const dueStatus = card.dueDate <= now ? 'overdue' : 
                         card.dueDate <= now + 86400000 ? 'due-today' : 'future';
        
        const dueText = card.dueDate <= now ? 'Due now' :
                       card.dueDate <= now + 86400000 ? 'Due today' :
                       `Due ${new Date(card.dueDate).toLocaleDateString()}`;
        
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card-item';
        cardDiv.innerHTML = `
            <div class="card-content-preview">
                <div class="card-german">${card.german}</div>
                <div class="card-english">${card.english}</div>
            </div>
            <div class="card-due ${dueStatus}">${dueText}</div>
        `;
        
        return cardDiv;
    }

    createDeck() {
        const nameInput = document.getElementById('deck-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('Please enter a deck name');
            return;
        }
        
        const deck = {
            id: `deck_${Date.now()}`,
            name: name,
            cards: []
        };
        
        this.decks.set(deck.id, deck);
        nameInput.value = '';
        this.showScreen('main-screen');
    }

    addCard() {
        if (!this.currentDeck) return;
        
        const germanInput = document.getElementById('german-word');
        const englishInput = document.getElementById('english-translation');
        
        const german = germanInput.value.trim();
        const english = englishInput.value.trim();
        
        if (!german || !english) {
            alert('Please enter both German and English text');
            return;
        }
        
        const card = {
            id: `card_${Date.now()}`,
            german: german,
            english: english,
            interval: 1,
            repetition: 0,
            easeFactor: 2.5,
            dueDate: Date.now(),
            lastReview: null
        };
        
        this.currentDeck.cards.push(card);
        germanInput.value = '';
        englishInput.value = '';
        
        this.showDeckScreen(this.currentDeck.id);
    }

    exportDeck() {
        if (!this.currentDeck) return;
        
        const dataStr = JSON.stringify(this.currentDeck, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.currentDeck.name}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    async handleApkgImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.name.endsWith('.apkg')) {
            this.showImportStatus('Please select a valid .apkg file', 'error');
            return;
        }
        
        this.showImportProgress(true);
        
        try {
            const deck = await this.parseApkgFile(file);
            this.decks.set(deck.id, deck);
            this.showImportStatus(`Successfully imported "${deck.name}" with ${deck.cards.length} cards`, 'success');
            
            // Clear file input
            event.target.value = '';
            
            // Auto-navigate back after success
            setTimeout(() => {
                this.showScreen('main-screen');
            }, 2000);
            
        } catch (error) {
            console.error('APKG import error:', error);
            this.showImportStatus(`Import failed: ${error.message}`, 'error');
        } finally {
            this.showImportProgress(false);
        }
    }

    async parseApkgFile(file) {
        // Load SQL.js
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        
        // Unzip the .apkg file
        const zip = await JSZip.loadAsync(file);
        
        // Find the database file (collection.anki2 or collection.anki21)
        let dbFile = zip.file('collection.anki2') || zip.file('collection.anki21');
        if (!dbFile) {
            throw new Error('No database file found in .apkg archive');
        }
        
        // Extract database content
        const dbContent = await dbFile.async('uint8array');
        const db = new SQL.Database(dbContent);
        
        // Extract deck name from col table
        let deckName = 'Imported Deck';
        try {
            const colResult = db.exec('SELECT decks FROM col LIMIT 1');
            if (colResult.length > 0) {
                const decksJson = JSON.parse(colResult[0].values[0][0]);
                const firstDeckId = Object.keys(decksJson).find(id => id !== '1');
                if (firstDeckId && decksJson[firstDeckId]) {
                    deckName = decksJson[firstDeckId].name || 'Imported Deck';
                }
            }
        } catch (e) {
            console.warn('Could not extract deck name:', e);
        }
        
        // Extract notes from the database
        const result = db.exec('SELECT flds FROM notes');
        
        if (result.length === 0) {
            throw new Error('No notes found in the database');
        }
        
        const cards = [];
        const notes = result[0].values;
        
        notes.forEach((note, index) => {
            try {
                const fields = note[0].split('\x1f'); // Anki uses \x1f as field separator
                
                if (fields.length >= 2) {
                    // Clean HTML tags from fields
                    const german = this.stripHtml(fields[0]).trim();
                    const english = this.stripHtml(fields[1]).trim();
                    
                    if (german && english) {
                        cards.push({
                            id: `imported_card_${Date.now()}_${index}`,
                            german: german,
                            english: english,
                            interval: 1,
                            repetition: 0,
                            easeFactor: 2.5,
                            dueDate: Date.now(),
                            lastReview: null
                        });
                    }
                }
            } catch (e) {
                console.warn('Error processing note:', e);
            }
        });
        
        db.close();
        
        if (cards.length === 0) {
            throw new Error('No valid cards could be extracted from the file');
        }
        
        return {
            id: `imported_deck_${Date.now()}`,
            name: deckName,
            cards: cards
        };
    }

    stripHtml(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    }

    showImportProgress(show) {
        const progressElement = document.getElementById('import-progress');
        if (show) {
            progressElement.classList.remove('hidden');
            // Animate progress bar
            const progressFill = progressElement.querySelector('.progress-fill');
            progressFill.style.width = '100%';
        } else {
            progressElement.classList.add('hidden');
        }
    }

    showImportStatus(message, type) {
        const statusElement = document.getElementById('import-status');
        statusElement.textContent = message;
        statusElement.className = `import-status ${type}`;
        statusElement.classList.remove('hidden');
    }

    startStudySession() {
        if (!this.currentDeck) return;
        
        const dueCards = this.currentDeck.cards.filter(card => card.dueDate <= Date.now());
        
        if (dueCards.length === 0) {
            alert('No cards are due for review!');
            return;
        }
        
        this.currentStudySession = {
            cards: [...dueCards],
            currentIndex: 0,
            showingAnswer: false
        };
        
        this.showScreen('study-screen');
        this.displayCurrentCard();
    }

    displayCurrentCard() {
        if (!this.currentStudySession) return;
        
        const session = this.currentStudySession;
        const card = session.cards[session.currentIndex];
        
        if (!card) {
            this.endStudySession();
            return;
        }
        
        // Update counter
        document.getElementById('study-counter').textContent = 
            `${session.currentIndex + 1} / ${session.cards.length}`;
        
        // Show German side
        document.getElementById('german-text').textContent = card.german;
        document.getElementById('english-text').textContent = card.english;
        
        // Reset card state
        document.getElementById('german-side').classList.remove('hidden');
        document.getElementById('english-side').classList.add('hidden');
        document.getElementById('flip-card-btn').classList.remove('hidden');
        document.getElementById('response-buttons').classList.add('hidden');
        
        session.showingAnswer = false;
    }

    flipCard() {
        if (!this.currentStudySession) return;
        
        document.getElementById('german-side').classList.add('hidden');
        document.getElementById('english-side').classList.remove('hidden');
        document.getElementById('flip-card-btn').classList.add('hidden');
        document.getElementById('response-buttons').classList.remove('hidden');
        
        this.currentStudySession.showingAnswer = true;
    }

    handleResponse(response) {
        if (!this.currentStudySession || !this.currentStudySession.showingAnswer) return;
        
        const session = this.currentStudySession;
        const card = session.cards[session.currentIndex];
        
        // Apply SM-2 algorithm
        this.updateCardSchedule(card, response);
        
        // Move to next card
        session.currentIndex++;
        this.displayCurrentCard();
    }

    updateCardSchedule(card, response) {
        const now = Date.now();
        card.lastReview = now;
        
        // SM-2 Algorithm implementation
        let quality;
        switch (response) {
            case 'again': quality = 0; break;
            case 'hard': quality = 2; break;
            case 'good': quality = 3; break;
            case 'easy': quality = 5; break;
            default: quality = 3;
        }
        
        if (quality >= 3) {
            if (card.repetition === 0) {
                card.interval = 1;
            } else if (card.repetition === 1) {
                card.interval = 6;
            } else {
                card.interval = Math.round(card.interval * card.easeFactor);
            }
            card.repetition++;
        } else {
            card.repetition = 0;
            card.interval = 1;
        }
        
        card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (card.easeFactor < 1.3) {
            card.easeFactor = 1.3;
        }
        
        card.dueDate = now + (card.interval * 24 * 60 * 60 * 1000);
    }

    endStudySession() {
        this.currentStudySession = null;
        if (this.currentDeck) {
            this.showDeckScreen(this.currentDeck.id);
        } else {
            this.showScreen('main-screen');
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FlashcardApp();
});

// Theme toggle logic
window.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const html = document.documentElement;
    const sunSVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
    const moonSVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>`;

    function setTheme(scheme) {
        html.setAttribute('data-color-scheme', scheme);
        if (scheme === 'dark') {
            themeIcon.innerHTML = moonSVG;
        } else {
            themeIcon.innerHTML = sunSVG;
        }
        localStorage.setItem('color-scheme', scheme);
    }

    // Initial theme
    const saved = localStorage.getItem('color-scheme');
    if (saved === 'dark' || saved === 'light') {
        setTheme(saved);
    } else {
        // Use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }

    themeToggle.addEventListener('click', function () {
        const current = html.getAttribute('data-color-scheme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    });
});