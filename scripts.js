// Tähän voit lisätä JavaScript-logiikan pelin käynnistämiseksi
// kun nappia klikataan. Esimerkiksi:
function startGame(gameType) {
    console.log("Käynnistetään peli:", gameType);

    // Äänen toisto hoidetaan yleisessä tapahtumankäsittelijässä alla.

    if (gameType === 'r') {
        // Viivästetään navigointia, jotta ääni ehtii soida
        setTimeout(() => {
            window.location.href = 'r_game.html'; // Ohjaa R-äänne -peliin
        }, 400); // 400 millisekunnin viive (säädä tarvittaessa)
    } else {
        // Tässä voitaisiin esim. navigoida toiselle sivulle
        // tai näyttää/piilottaa pelielementtejä tällä sivulla.
        // Esimerkiksi: window.location.href = '/peli.html?type=' + gameType;
        alert("Peli '" + gameType + "' valittu, mutta navigointia ei ole vielä toteutettu."); // Päivitetty palaute
    }
}

// Lisätään toiminnallisuus "Takaisin"-napille, jos se löytyy sivulta
document.addEventListener('DOMContentLoaded', () => {
    // Ladataan äänitiedosto
    const coinSound = new Audio('sounds/coin2.mp3');

    // Haetaan kaikki pelin valintanapit
    const gameButtons = document.querySelectorAll('.game-option');

    // Lisätään jokaiseen nappiin klikkaustapahtuma äänen soittamiseksi
    gameButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Varmistetaan, että ääni alkaa alusta, jos sitä klikataan nopeasti uudelleen
            coinSound.currentTime = 0;
            coinSound.play().catch(error => {
                // Joskus automaattinen toisto estetään selaimessa ilman käyttäjän interaktiota ensin
                console.error("Äänen toisto epäonnistui:", error);
            });
        });
    });

    const backButton = document.getElementById('back-button');
    if (backButton) {
        // Huom: Ääni soitetaan jo yllä olevan yleisen käsittelijän kautta,
        // joten emme tarvitse erillistä soittoa tässä.
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html'; // Ohjaa takaisin aloitussivulle
        });
    }

    // === R-äänne pelilogiikka (2 pelaajaa) ===
    const gridContainer = document.getElementById('grid-container');
    if (gridContainer) {
        // Äänet
        const foundCoinSound = new Audio('sounds/coin.mp3');
        const winSound = new Audio('sounds/win.mp3');
        // coinSound (yleinen klikkaus) on ladattu jo aiemmin

        // DOM Elementit
        const turnIndicator = document.getElementById('turn-indicator');
        const score1Display = document.getElementById('score-1');
        const score2Display = document.getElementById('score-2');
        const winMessageOverlay = document.getElementById('win-message-overlay');
        const winnerText = document.getElementById('winner-text');
        const playAgainButton = document.getElementById('play-again-button');
        const backToMenuButton = document.getElementById('back-to-menu-button');

        // Pelin tila
        let currentPlayer = 1;
        let scores = { 1: 0, 2: 0 };
        let coinsFound = 0;
        let gameActive = true;

        const imagesBasePath = 'images/r-images/';
        const rImages = [
            'Raketti.png', 'Ruusu.png', 'Ranskalaiset.png', 'Rusetti.png',
            'Rubiini.png', 'Ratti.png', 'Reki.png', 'Reppu.png',
            'Rekka.png', 'Rotta.png', 'Rapu.png'
        ];
        const totalCards = 12;
        const numberOfCoins = 5;
        let coinIndices = new Set();
        let shuffledImages = [];

        // Sekoitusfunktio
        function shuffle(array) {
             for (let i = array.length - 1; i > 0; i--) {
                 const j = Math.floor(Math.random() * (i + 1));
                 [array[i], array[j]] = [array[j], array[i]];
             }
             return array;
         }

        // Pelin alustus/resetointi
        function initGame() {
            gameActive = true;
            currentPlayer = 1;
            scores = { 1: 0, 2: 0 };
            coinsFound = 0;
            updateUI();
            winMessageOverlay.classList.add('hidden');
            gridContainer.innerHTML = ''; // Tyhjennä vanha ruudukko

            // Luo kuvat ja sekoita
            const gameImages = [...rImages, rImages[Math.floor(Math.random() * rImages.length)]];
            shuffledImages = shuffle(gameImages);

            // Arvo kolikkopaikat
            coinIndices.clear();
            while (coinIndices.size < numberOfCoins) {
                coinIndices.add(Math.floor(Math.random() * totalCards));
            }

            // Luo kortit
            for (let i = 0; i < totalCards; i++) {
                 const card = document.createElement('div');
                 card.classList.add('grid-card');
                 card.dataset.index = i;
                 const hasCoin = coinIndices.has(i);
                 if (hasCoin) {
                     card.dataset.hasCoin = 'true';
                 }

                 const cardImage = document.createElement('img');
                 cardImage.classList.add('card-image');
                 cardImage.src = imagesBasePath + shuffledImages[i];
                 cardImage.alt = shuffledImages[i].split('.')[0];

                 const coinImage = document.createElement('img');
                 coinImage.classList.add('coin-image');
                 coinImage.src = 'images/Kolikko.png';
                 coinImage.alt = 'Kolikko';

                 card.appendChild(cardImage);
                 card.appendChild(coinImage);

                 card.addEventListener('click', handleCardClick);
                 gridContainer.appendChild(card);
             }
        }

        // Kortin klikkauksen käsittely
        function handleCardClick(event) {
            if (!gameActive) return; // Älä tee mitään, jos peli ei ole aktiivinen

            const clickedCard = event.currentTarget;
            if (clickedCard.classList.contains('disabled')) {
                return;
            }

            // Lisää klikkausanimaatioluokka
            clickedCard.classList.add('card-clicked');

            // Poista animaatioluokka pienen viiveen jälkeen
            setTimeout(() => {
                 clickedCard.classList.remove('card-clicked');
            }, 200); // 200ms on sama kuin transition kesto

            // Soita yleinen klikkausääni
            if (coinSound) {
                 coinSound.currentTime = 0;
                 coinSound.play().catch(error => console.error("Klikkausäänen toisto epäonnistui:", error));
             }

            clickedCard.classList.add('disabled');

            if (clickedCard.dataset.hasCoin === 'true') {
                // Kolikko löytyi
                clickedCard.classList.add('found');
                scores[currentPlayer]++;
                coinsFound++;

                // Päivitetään UI näyttämään uusi kolikko HETI
                updateUI();

                // Soita kolikon löytöääni
                if (foundCoinSound) {
                    foundCoinSound.currentTime = 0;
                    foundCoinSound.play().catch(error => console.error("Kolikkoäänen toisto epäonnistui:", error));
                }

                // Tarkista voitto VASTA UI-päivityksen jälkeen
                if (scores[currentPlayer] >= 3) {
                    endGame(currentPlayer);
                } else {
                    // Pelaaja jatkaa vuoroa, koska löysi kolikon
                    // UI on jo päivitetty, ei tarvitse tehdä mitään tässä
                    // updateUI(); // Tämä rivi oli aiemmin täällä, poistetaan/kommentoidaan
                }
            } else {
                // Ei kolikkoa, piilota kuva ja vaihda vuoro
                clickedCard.classList.add('hidden');
                switchPlayer();
                updateUI(); // Päivitetään UI vuoronvaihdon jälkeen
            }
        }

        // Vaihda pelaajaa
        function switchPlayer() {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
        }

        // Päivitä käyttöliittymä (pisteet, vuoro)
        function updateUI() {
            turnIndicator.innerHTML = `Pelaajan <span class="player-number">${currentPlayer}</span> vuoro`;

            // Generoidaan kolikko-kuvat pisteiden perusteella
            let score1Html = 'Pelaaja 1: ';
            for (let i = 0; i < scores[1]; i++) {
                score1Html += `<img class="score-coin-img" src="images/Kolikko.png" alt="Kolikko">`;
            }
            score1Display.innerHTML = score1Html;

            let score2Html = 'Pelaaja 2: ';
            for (let i = 0; i < scores[2]; i++) {
                score2Html += `<img class="score-coin-img" src="images/Kolikko.png" alt="Kolikko">`;
            }
            score2Display.innerHTML = score2Html;
        }

        // Pelin lopetus
        function endGame(winner) {
            gameActive = false;
            winnerText.textContent = `Pelaaja ${winner} Voitti!`;
            winMessageOverlay.classList.remove('hidden');
            // Soita voittoääni
             if (winSound) {
                 winSound.currentTime = 0;
                 winSound.play().catch(error => console.error("Voittoäänen toisto epäonnistui:", error));
             }
             // Poista klikkausten esto korteilta (jos halutaan näyttää loput)
             // document.querySelectorAll('.grid-card').forEach(card => card.classList.remove('disabled'));
        }

        // Voittoviestin nappien tapahtumankäsittelijät
        playAgainButton.addEventListener('click', initGame);
        backToMenuButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Alusta peli, kun sivu ladataan
        initGame();
    }
    // === Pelilogiikan loppu ===

    // Tähän voi lisätä myöhemmin pyöräytysnapin toiminnallisuuden
    // const spinButton = document.getElementById('spin-button');
    // if (spinButton) {
    //     spinButton.addEventListener('click', () => {
    //         // Pelilogiikka...
    //     });
    // }
}); 