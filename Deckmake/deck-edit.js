document.addEventListener('DOMContentLoaded', () => {
    const deckList = document.getElementById('deckList');
    const deckEdit = document.getElementById('deckEdit');
    const deckName = document.getElementById('deckName');
    const availableCards = document.getElementById('availableCards');
    const currentDeck = document.getElementById('currentDeck');
    const cardSearch = document.getElementById('cardSearch');

    let editingDeckName = '';
    let allCards = [];

const loadCardList = () => {
  allCards = cardList; // 直接代入
  displayAvailableCards(allCards);
};

    // カードリストを表示する関数
    const displayAvailableCards = (cards) => {
        availableCards.innerHTML = '';
        cards.forEach(card => {
            const cardElement = createCardElement(card);
            availableCards.appendChild(cardElement);
        });
    };

    // カード要素を作成する関数（画像を含む）
    const createCardElement = (card) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card-item');
        cardDiv.dataset.cardId = card.id;

        const cardImage = document.createElement('img');
        cardImage.src = card.image;
        cardImage.alt = card.name;
        cardImage.style.width = '100%';
        cardImage.style.height = '100%';

        cardDiv.appendChild(cardImage);

        cardDiv.addEventListener('click', () => {
            const sameCards = [...currentDeck.querySelectorAll('.card-item')].filter(c => c.dataset.cardId === card.id);
            if (currentDeck.children.length < 40 && sameCards.length < 4) {
                const clone = cardDiv.cloneNode(true);
                clone.addEventListener('click', () => {
                    clone.remove();
                    updateGridLayout();
                });
                currentDeck.appendChild(clone);
                updateGridLayout();
            } else if (sameCards.length >= 4) {
                alert('同じカードは4枚までです。');
            } else {
                alert('デッキは40枚までです。');
            }
        });

        return cardDiv;
    };

    const updateGridLayout = () => {
        const cards = currentDeck.children;
        let rowIndex = 0, colIndex = 0;

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            card.style.gridRowStart = rowIndex + 1;
            card.style.gridColumnStart = colIndex + 1;

            colIndex++;
            if (colIndex >= 8) {
                colIndex = 0;
                rowIndex++;
            }
        }
    };

    // カード検索機能
    cardSearch.addEventListener('input', () => {
        const query = cardSearch.value.toLowerCase();
        const filteredCards = allCards.filter(card => card.name.toLowerCase().includes(query));
        displayAvailableCards(filteredCards);
    });

    // ページロード時にカードリストを読み込む
    loadCardList();

    // 以下、既存のデッキ編集用の関数を追加
    window.editDeck = (name) => {
        editingDeckName = name;
        deckName.textContent = name;
        deckList.style.display = 'none';
        deckEdit.style.display = 'block';
        loadDeck(name);
    };

    window.closeDeckEdit = () => {
        deckList.style.display = 'block';
        deckEdit.style.display = 'none';
    };

    window.saveDeck = () => {
    const deckCards = [...currentDeck.querySelectorAll('.card-item')].map(card => card.dataset.cardId);
    if (deckCards.length === 40) {
        // デッキデータをJSON形式で文字列に変換
        const deckData = JSON.stringify(deckCards);

        // Blobオブジェクトを作成
        const blob = new Blob([deckData], { type: 'application/json' });

        // ダウンロードリンクを作成
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${editingDeckName}.json`; // ファイル名
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        alert(`デッキ「${editingDeckName}」が保存されました`);
    } else {
        alert('デッキは40枚にする必要があります。');
    }
};

    const loadDeck = (name) => {
        currentDeck.innerHTML = '';
        const savedDeck = JSON.parse(localStorage.getItem(name));
        if (savedDeck) {
            savedDeck.forEach(cardId => {
                const cardData = allCards.find(card => card.id === cardId);
                if (cardData) {
                    const card = createCardElement(cardData);
                    currentDeck.appendChild(card);
                }
            });
            updateGridLayout();
        }
    };
});