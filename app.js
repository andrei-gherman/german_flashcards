// German Vocabulary Flashcard App
class FlashcardApp {
    constructor() {
        this.decks = new Map();
        this.currentDeck = null;
        this.currentStudySession = null;
        
        // Load data from localStorage
        this.loadDecks();

        // Initialize with sample data only if no decks are loaded
        if (this.decks.size === 0) {
            this.initializeSampleData();
        }

        // Event listeners are now page-specific and will be initialized in each HTML file's script block
        // this.initializeEventListeners(); 
    }

    loadDecks() {
        let storedData = localStorage.getItem('flashcardData');
        let needsMigration = false;

        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData.version !== 2 || !parsedData.decks) {
                console.warn('Migrating old flashcard data format from flashcardData key...');
                const oldDecks = parsedData.map ? parsedData : parsedData.decks; // Handle cases where old data might be directly the array of decks
                this.decks = new Map(oldDecks.map(deck => [
                    deck.id, 
                    { // Create new deck object to ensure consistent structure
                        id: deck.id,
                        name: deck.name,
                        cards: deck.cards.map(card => ({
                            ...card,
                            dueDate: typeof card.dueDate === 'string' ? new Date(card.dueDate).getTime() : card.dueDate
                        }))
                    }
                ]));
                needsMigration = true; // Mark to save updated data
            } else {
                this.decks = new Map(parsedData.decks.map(deck => [deck.id, deck]));
            }
        } else {
            // No data under the new key, check the old key
            const oldSavedDecks = localStorage.getItem('flashcardDecks');
            if (oldSavedDecks) {
                console.warn('Migrating old flashcard data from flashcardDecks key...');
                const parsedOldDecks = JSON.parse(oldSavedDecks);
                this.decks = new Map(parsedOldDecks.map(deck => [
                    deck.id,
                    {
                        id: deck.id,
                        name: deck.name,
                        cards: deck.cards.map(card => ({
                            ...card,
                            dueDate: typeof card.dueDate === 'string' ? new Date(card.dueDate).getTime() : card.dueDate
                        }))
                    }
                ]));
                needsMigration = true; // Mark to save updated data
                localStorage.removeItem('flashcardDecks'); // Remove old key after migration
            }
        }

        if (needsMigration) {
            this.saveDecks(); // Save migrated data immediately
        }
    }

    saveDecks() {
        // Store data with a version number
        const dataToSave = {
            version: 2,
            decks: Array.from(this.decks.values())
        };
        localStorage.setItem('flashcardData', JSON.stringify(dataToSave)); // Changed key to 'flashcardData'
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
        this.saveDecks(); // Save sample data immediately
    }

    showScreen(screenId) {
        // This method is for SPA navigation and will be deprecated for direct page loads.
        // Its functionality will be replaced by direct window.location.href in specific methods.
        console.warn(`showScreen(${screenId}) called. This method is deprecated in multi-page mode.`);
    }

    updateDeckList() {
        // This method will be called directly by main.html on DOMContentLoaded
        const deckList = document.getElementById('deck-list');
        if (!deckList) return; // Ensure element exists
        
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
        
        // Create deck content div
        const deckContent = document.createElement('div');
        deckContent.className = 'deck-content';
        deckContent.addEventListener('click', () => {
            localStorage.setItem('currentDeckId', deck.id);
            window.location.href = 'deck.html';
        });
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn--icon btn--danger deck-delete-btn';
        deleteBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
        `;
        deleteBtn.title = 'Delete deck';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent deck click event
            this.deleteDeck(deck.id);
        });
        
        deckContent.innerHTML = `\
            <div class="deck-item-header">\
                <h3 class="deck-name">${deck.name}</h3>\
                <div class="deck-stats-inline">\
                    <span>${totalCards} cards</span>\
                    <span>${dueCards} due</span>\
                </div>\
            </div>\
            <div class="deck-progress">\
                <div class="deck-progress-fill" style="width: ${progress}%_\"></div>\
            </div>\
        `;
        
        deckDiv.appendChild(deckContent);
        deckDiv.appendChild(deleteBtn);
        return deckDiv;
    }

    deleteDeck(deckId) {
        if (!confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
            return;
        }
        
        this.decks.delete(deckId);
        this.saveDecks();
        
        // If we're on the deck page and this is the current deck, redirect to main
        if (this.currentDeck && this.currentDeck.id === deckId) {
            window.location.href = 'main.html';
        } else {
            // Otherwise just update the deck list
            this.updateDeckList();
        }
    }

    showDeckScreen(deckId) {
        // This method is now used to load a specific deck when deck.html loads
        this.currentDeck = this.decks.get(deckId);
        if (!this.currentDeck) {
            console.error('Deck not found:', deckId);
            window.location.href = 'main.html'; // Redirect to main if deck not found
            return;
        }
        // Populate deck details on the page
        document.getElementById('deck-title').textContent = this.currentDeck.name;
        document.getElementById('total-cards').textContent = this.currentDeck.cards.length;
        document.getElementById('due-cards').textContent = 
            this.currentDeck.cards.filter(card => card.dueDate <= Date.now()).length;
        
        this.updateCardList();
        // showScreen('deck-screen'); // No longer needed
    }

    updateCardList() {
        // This method will be called directly by deck.html on DOMContentLoaded
        const cardList = document.getElementById('card-list');
        if (!cardList || !this.currentDeck) return; // Ensure elements exist

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
        cardDiv.innerHTML = `\
            <div class="card-content-preview">\
                <div class="card-german">${card.german}</div>\
                <div class="card-english">${card.english}</div>\
            </div>\
            <div class="card-due ${dueStatus}\">${dueText}</div>\
        `;
        
        return cardDiv;
    }

    createDeck() {
        const nameInput = document.getElementById('deck-name');
        if (!nameInput) return; // Ensure element exists

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
        this.saveDecks(); // Save after creating
        nameInput.value = '';
        window.location.href = 'main.html'; // Redirect to main menu
    }

    addCard() {
        // currentDeck must be loaded on add-card.html page load
        if (!this.currentDeck) {
            console.error('Current deck not set for adding card.');
            alert('Please select a deck first.');
            window.location.href = 'main.html';
            return;
        }
        
        const germanInput = document.getElementById('german-word');
        const englishInput = document.getElementById('english-translation');
        
        if (!germanInput || !englishInput) return; // Ensure elements exist

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
        this.saveDecks(); // Save after adding card
        germanInput.value = '';
        englishInput.value = '';
        
        localStorage.setItem('currentDeckId', this.currentDeck.id); // Re-set ID for redirect
        window.location.href = 'deck.html'; // Redirect to deck view
    }

    exportDeck() {
        if (!this.currentDeck) {
            alert('No deck selected for export.');
            return;
        }
        
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
        console.log("handleApkgImport: Function called.");
        const file = event.target.files[0];
        if (!file) {
            console.log("handleApkgImport: No file selected.");
            return;
        }
        console.log("handleApkgImport: File selected:", file.name, "Type:", file.type, "Size:", file.size, "bytes");

        if (!file.name.endsWith('.apkg')) {
            this.showImportStatus('Please select a valid .apkg file', 'error');
            console.warn("handleApkgImport: Invalid file type.");
            return;
        }

        this.showImportProgress(true);

        try {
            console.log("handleApkgImport: Attempting to parse APKG file...");
            const deck = await this.parseApkgFile(file);
            console.log("handleApkgImport: APKG file parsed successfully.", deck);

            // Check if a deck with this name already exists
            const existingDeck = Array.from(this.decks.values()).find(d => d.name === deck.name);
            if (existingDeck) {
                this.showImportStatus(`A deck with the name "${deck.name}" already exists. Import cancelled.`, 'error');
                console.warn(`handleApkgImport: Duplicate deck name detected: ${deck.name}. Import cancelled.`);
                this.showImportProgress(false); // Hide progress if cancelled
                event.target.value = ''; // Clear file input
                return; // Stop the import process
            }

            this.decks.set(deck.id, deck);
            this.saveDecks(); // Save after import
            console.log("handleApkgImport: Deck saved.");
            this.showImportStatus(`Successfully imported "${deck.name}" with ${deck.cards.length} cards`, 'success');
            
            // Clear file input
            event.target.value = '';
            console.log("handleApkgImport: File input cleared.");
            
            // Auto-navigate back after success
            setTimeout(() => {
                console.log("handleApkgImport: Redirecting to main.html");
                window.location.href = 'main.html'; // Redirect to main menu
            }, 2000);
            
        } catch (error) {
            console.error('APKG import error:', error);
            this.showImportStatus(`Import failed: ${error.message}`, 'error');
        } finally {
            console.log("handleApkgImport: Hiding import progress.");
            this.showImportProgress(false);
        }
    }

    async parseApkgFile(file) {
        console.log("parseApkgFile: Starting parsing process.");
        // Load SQL.js
        console.log("parseApkgFile: Initializing SQL.js...");
        const SQL = await initSqlJs({
            locateFile: file => {
                console.log("parseApkgFile: Locating SQL.js file:", file);
                return `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`;
            }
        });
        console.log("parseApkgFile: SQL.js initialized.", SQL);
        
        // Unzip the .apkg file
        console.log("parseApkgFile: Loading APKG file with JSZip...");
        const zip = await JSZip.loadAsync(file);
        console.log("parseApkgFile: APKG file loaded by JSZip.", zip);
        
        // Find the database file (collection.anki2 or collection.anki21)
        console.log("parseApkgFile: Looking for database file (collection.anki2 or collection.anki21)...");
        let dbFile = zip.file('collection.anki2') || zip.file('collection.anki21');
        if (!dbFile) {
            console.error("parseApkgFile: Error: No database file found.");
            throw new Error('No database file found in .apkg archive');
        }
        console.log("parseApkgFile: Database file found:", dbFile.name);
        
        // Extract database content
        console.log("parseApkgFile: Extracting database content...");
        const dbContent = await dbFile.async('uint8array');
        console.log("parseApkgFile: Database content extracted. Size:", dbContent.length, "bytes");
        const db = new SQL.Database(dbContent);
        console.log("parseApkgFile: SQL.js database opened.", db);
        
        // Extract deck name from col table
        let deckName = 'Imported Deck';
        try {
            console.log("parseApkgFile: Querying for deck name...");
            const colResult = db.exec('SELECT decks FROM col LIMIT 1');
            if (colResult.length > 0) {
                const decksJson = JSON.parse(colResult[0].values[0][0]);
                const firstDeckId = Object.keys(decksJson).find(id => id !== '1');
                if (firstDeckId && decksJson[firstDeckId]) {
                    deckName = decksJson[firstDeckId].name || 'Imported Deck';
                }
            }
            console.log("parseApkgFile: Deck name extracted:", deckName);
        } catch (e) {
            console.warn('parseApkgFile: Could not extract deck name:', e);
        }
        
        // Extract notes from the database
        console.log("parseApkgFile: Querying for notes...");
        const result = db.exec('SELECT flds FROM notes');
        
        if (result.length === 0) {
            console.error("parseApkgFile: Error: No notes found in the database.");
            throw new Error('No notes found in the database');
        }
        console.log("parseApkgFile: Notes found. Number of notes:", result[0].values.length);
        
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
                } else {
                    console.warn(`parseApkgFile: Note ${index} has less than 2 fields, skipping.`);
                }
            } catch (e) {
                console.warn(`parseApkgFile: Error processing note ${index}:`, e);
            }
        });
        
        db.close();
        console.log("parseApkgFile: Database closed. Extracted cards count:", cards.length);
        
        if (cards.length === 0) {
            console.error("parseApkgFile: Error: No valid cards could be extracted.");
            throw new Error('No valid cards could be extracted from the file');
        }
        
        const newDeck = {
            id: `imported_deck_${Date.now()}`,
            name: deckName,
            cards: cards
        };
        console.log("parseApkgFile: New deck object created:", newDeck);
        return newDeck;
    }

    stripHtml(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    }

    showImportProgress(show) {
        const progressElement = document.querySelector('.import-progress');
        if (!progressElement) {
            console.error("showImportProgress: '.import-progress' element not found!");
            return; // Prevent crash
        }
        if (show) {
            progressElement.classList.remove('hidden');
            // Animate progress bar
            const progressFill = progressElement.querySelector('.progress-fill');
            if (progressFill) { // Add null check for progressFill as well
                progressFill.style.width = '100%';
            } else {
                console.error("showImportProgress: '.progress-fill' element not found!");
            }
        } else {
            progressElement.classList.add('hidden');
        }
    }

    showImportStatus(message, type) {
        const statusElement = document.querySelector('.import-status');
        if (!statusElement) {
            console.error("showImportStatus: '.import-status' element not found!");
            return; // Prevent crash
        }
        statusElement.textContent = message;
        statusElement.className = `import-status ${type}`;
        statusElement.classList.remove('hidden');
    }

    startStudySession() {
        if (!this.currentDeck) {
            alert('Please select a deck to study!');
            window.location.href = 'main.html';
            return;
        }
        // Save current deck ID before redirecting to study page
        localStorage.setItem('currentDeckId', this.currentDeck.id);
        window.location.href = 'study.html';
    }

    endStudySession() {
        this.currentStudySession = null;
        if (this.currentDeck) {
            localStorage.setItem('currentDeckId', this.currentDeck.id); // Re-set ID for redirect
            window.location.href = 'deck.html'; // Redirect back to deck view
        } else {
            window.location.href = 'main.html'; // Redirect to main menu
        }
    }

    // New method to initialize a study session when study.html loads
    initializeStudySession() {
        console.log("initializeStudySession: Starting initialization.");
        if (!this.currentDeck) {
            console.error('initializeStudySession: Error: No deck selected for study session.');
            window.location.href = 'main.html';
            return;
        }
        console.log("initializeStudySession: Current deck:", this.currentDeck.name);

        const dueCards = this.currentDeck.cards.filter(card => {
            const isDue = card.dueDate <= Date.now();
            console.log(`Card ID: ${card.id}, Due Date: ${new Date(card.dueDate).toLocaleString()}, Now: ${new Date(Date.now()).toLocaleString()}, Is Due: ${isDue}`);
            return isDue;
        });

        console.log("initializeStudySession: Found", dueCards.length, "due cards.");

        if (dueCards.length === 0) {
            alert('No cards are due for review in this deck!');
            console.warn("initializeStudySession: No cards due, redirecting to deck.html");
            window.location.href = 'deck.html'; // Redirect back to deck view if no cards
            return;
        }

        // Shuffle the due cards using Fisher-Yates algorithm
        for (let i = dueCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [dueCards[i], dueCards[j]] = [dueCards[j], dueCards[i]];
        }

        this.currentStudySession = {
            cards: [...dueCards],
            currentIndex: 0,
            showingAnswer: false
        };
        console.log("initializeStudySession: Study session initialized with", this.currentStudySession.cards.length, "cards.");

        this.displayCurrentCard();
        console.log("initializeStudySession: displayCurrentCard() called.");
    }

    displayCurrentCard() {
        console.log("displayCurrentCard: Entering method.");
        if (!this.currentStudySession) {
            console.warn("displayCurrentCard: No current study session, ending session.");
            this.endStudySession(); // End session if no current session (e.g., all cards done)
            return;
        }

        const session = this.currentStudySession;
        const card = session.cards[session.currentIndex];

        if (!card) {
            console.warn("displayCurrentCard: No card at current index, ending session.");
            this.endStudySession(); // All cards in session reviewed
            return;
        }
        console.log("displayCurrentCard: Displaying card at index", session.currentIndex, "Card German:", card.german);

        // Update counter
        const studyCounter = document.getElementById('study-counter');
        if (studyCounter) {
            studyCounter.textContent = 
                `${session.currentIndex + 1} / ${session.cards.length}`;
            console.log("displayCurrentCard: Study counter updated to", studyCounter.textContent);
        }

        // Show German side
        const germanText = document.getElementById('german-text');
        const englishText = document.getElementById('english-text');
        const germanSide = document.getElementById('german-side');
        const englishSide = document.getElementById('english-side');
        const flipCardBtn = document.getElementById('flip-card-btn');
        const responseButtons = document.getElementById('response-buttons');

        if (germanText) germanText.textContent = card.german;
        if (englishText) englishText.textContent = card.english;
        
        // Reset card state
        if (germanSide) germanSide.classList.remove('hidden');
        if (englishSide) englishSide.classList.add('hidden');
        if (flipCardBtn) flipCardBtn.classList.remove('hidden');
        if (responseButtons) responseButtons.classList.add('hidden');
        
        session.showingAnswer = false;
        console.log("displayCurrentCard: Card content updated and state reset.");
    }

    flipCard() {
        if (!this.currentStudySession) return;
        
        const germanSide = document.getElementById('german-side');
        const englishSide = document.getElementById('english-side');
        const flipCardBtn = document.getElementById('flip-card-btn');
        const responseButtons = document.getElementById('response-buttons');

        if (germanSide) germanSide.classList.add('hidden');
        if (englishSide) englishSide.classList.remove('hidden');
        if (flipCardBtn) flipCardBtn.classList.add('hidden');
        if (responseButtons) responseButtons.classList.remove('hidden');
        
        this.currentStudySession.showingAnswer = true;
    }

    handleResponse(response) {
        if (!this.currentStudySession || !this.currentStudySession.showingAnswer) return;
        
        const session = this.currentStudySession;
        const card = session.cards[session.currentIndex];
        
        // Apply SM-2 algorithm
        this.updateCardSchedule(card, response);
        this.saveDecks(); // Save decks after card schedule update

        // Move to next card
        session.currentIndex++;
        this.displayCurrentCard(); // This will automatically end the session if no more cards
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
}

// Initialize the app on each page load. Specific page logic will call appropriate FlashcardApp methods.
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FlashcardApp(); // Make app instance globally accessible
});

// Theme toggle logic
window.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const html = document.documentElement;
    if (!themeToggle || !themeIcon) {
        console.log('Theme toggle or icon not found');
        return;
    }
    console.log('Theme toggle and icon found, initializing theme logic');
    function setTheme(scheme) {
        if (scheme === 'dark') {
            themeIcon.classList.add('dark-mode-active');
        } else {
            themeIcon.classList.remove('dark-mode-active');
        }
        html.setAttribute('data-color-scheme', scheme);
        localStorage.setItem('color-scheme', scheme);
    }
    // Initial theme
    const saved = localStorage.getItem('color-scheme');
    if (saved === 'dark' || saved === 'light') {
        setTheme(saved);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }
    themeToggle.addEventListener('click', function () {
        const current = html.getAttribute('data-color-scheme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    });
});