document.addEventListener('DOMContentLoaded', () => {
  const showDeckButton = document.getElementById('showDeck');
  const deckFileInput = document.getElementById('deckFileInput');
  const deck = document.querySelector('.deck');
  const drawCardButton = document.getElementById('drawCard');
  const handContainer = document.querySelector('.hand-container');
  const shieldZone = document.querySelector('.shield-zone');
  const setupButton = document.getElementById('setupbutton');
  
  deckFileInput.addEventListener('change', handleDeckFileChange);
  drawCardButton.addEventListener('click', drawCard);
  showDeckButton.addEventListener('click', toggleDeckVisibility);
  setupButton.addEventListener('click', setupGame);
  
  function handleDeckFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const deckData = JSON.parse(event.target.result);
          if (!Array.isArray(deckData)) throw new Error("デッキデータが配列ではありません");
          loadDeck(deckData);
        } catch (error) {
          console.error('無効なデッキファイル:', error);
          alert('無効なデッキファイルです。');
        }
      };
      reader.readAsText(file);
    }
  }
  
  function createCardFromData(cardData) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.cardId = cardData.id;
    card.dataset.cardName = cardData.name;
    card.dataset.faceUp = true;
    card.style.backgroundImage = `url('')`;
    
    initializeTouchEvents(card, cardData);
    
    return card;
  }
  
  function initializeTouchEvents(card, cardData) {
    let isTapped = false;
    let touchStartTime;
    let touchStartPosition;
    let isDragging = false;
    let longPressTimer;
    
    card.addEventListener('touchstart', (e) => {
      touchStartTime = new Date().getTime();
      touchStartPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isDragging = false;
      
      longPressTimer = setTimeout(() => {
        toggleCardFace(card, cardData);
      }, 800);
    });
    
    card.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const moveDistance = Math.sqrt(
        Math.pow(touch.clientX - touchStartPosition.x, 2) +
        Math.pow(touch.clientY - touchStartPosition.y, 2)
      );
      
      if (moveDistance > 10) {
        isDragging = true;
        moveCard(card, touch);
        clearTimeout(longPressTimer);
      }
    });
    
    card.addEventListener('touchend', (e) => {
      clearTimeout(longPressTimer);
      card.style.opacity = '1';
      
      handleTouchEnd(e, card, cardData, isTapped);
    });
  }
  
  function moveCard(card, touch) {
    card.style.position = 'absolute';
    card.style.left = `${touch.clientX - card.offsetWidth / 2}px`;
    card.style.top = `${touch.clientY - card.offsetHeight / 2}px`;
    card.style.opacity = '0.7';
  }
  
  function handleTouchEnd(e, card, cardData, isTapped) {
    const touchEndTime = new Date().getTime();
    const touch = e.changedTouches[0];
    let dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    let zone = dropTarget ? dropTarget.closest('.zone') : null;
    
    if (zone) {
      zone.appendChild(card);
      card.style.position = 'static';
      
      if (zone === shieldZone) {
        toggleCardFace(card, cardData);
      }
    } else {
      card.style.position = 'static';
    }
    
    if (!isDragging && (touchEndTime - touchStartTime) < 300) {
      isTapped = !isTapped;
      toggleTappedState(card, isTapped);
    }
  }
  
  function toggleTappedState(card, isTapped) {
    if (isTapped) {
      card.style.transform = 'rotate(-90deg)';
      card.classList.add('tapped');
    } else {
      card.style.transform = 'rotate(0deg)';
      card.classList.remove('tapped');
    }
  }
  
  function toggleCardFace(card, cardData) {
    const isFaceUp = card.dataset.faceUp === "true";
    card.style.backgroundImage = isFaceUp ? `url('./images/card-back.jpg')` : `url('')`;
    card.dataset.faceUp = !isFaceUp;
  }
  
  function loadDeck(deckData) {
    deck.innerHTML = '';
    deckData.forEach(cardId => {
      const cardData = cardList.find(card => card.id === cardId);
      if (cardData) {
        const card = createCardFromData(cardData);
        deck.appendChild(card);
      } else {
        console.error(`Card with ID not found.`);
      }
    });
    
    alert('デッキが読み込まれました！');
  }
  
  function shuffleDeck(deckElement) {
    const cards = Array.from(deckElement.children);
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      deckElement.appendChild(cards[j]);
    }
  }
  
  function drawCard() {
    if (deck.firstChild) {
      const card = deck.firstChild;
      deck.removeChild(card);
      handContainer.appendChild(card);
    } else {
      alert("山札が空です！");
    }
  }
  
  function toggleDeckVisibility() {
    if (deck.children.length === 0) {
      deckFileInput.click();
    } else {
      deck.classList.toggle('deck-window');
    }
  }
  
  function setupGame() {
    shuffleDeck(deck);
    moveCardsToZone(deck, shieldZone, 5);
    moveCardsToZone(deck, handContainer, 5);
    alert('セットアップ完了！');
  }
  
  function moveCardsToZone(deckElement, targetZone, numberOfCards) {
    for (let i = 0; i < numberOfCards; i++) {
      if (deckElement.firstChild) {
        const card = deckElement.firstChild;
        deckElement.removeChild(card);
        targetZone.appendChild(card);
        
        if (targetZone === shieldZone) {
          toggleCardFace(card, { image: '' });
        }
      }
    }
  }
});