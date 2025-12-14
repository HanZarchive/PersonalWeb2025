let currentSelection = {
    hair: 1,
    tops: 1,
    bottoms: 1,
    shoes: 1,
    accessory: 1
};

const imagePaths = {
    hair: 'img/hair/hair',
    tops: 'img/tops/tops',          
    bottoms: 'img/bottoms/bottoms', 
    shoes: 'img/shoes/shoes',
    accessory: 'img/accessory/acc'
};

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
}

function changeItem(category, index) {
    currentSelection[category] = index;
    
    const layerId = category + '-layer';
    const imgPath = imagePaths[category] + index + '.png';
    document.getElementById(layerId).src = imgPath;
    
    updateButtonState(category, index);
}

function updateButtonState(category, activeIndex) {
    const categories = document.querySelectorAll('.category');
    categories.forEach(cat => {
        const title = cat.querySelector('h3').textContent;
        
        let matchCategory = false;
        if (category === 'hair' && title.includes('Hairstyles')) matchCategory = true;
        if (category === 'tops' && title.includes('Tops')) matchCategory = true;
        if (category === 'bottoms' && title.includes('Bottoms')) matchCategory = true;
        if (category === 'shoes' && title.includes('Shoes')) matchCategory = true;
        if (category === 'accessory' && title.includes('Accessories')) matchCategory = true;
        
        if (matchCategory) {
            const buttons = cat.querySelectorAll('.option-btn');
            buttons.forEach((btn, i) => {
                if (i + 1 === activeIndex) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    });
}

function showResult() {
    document.getElementById('game-screen').style.display = 'none';
    
    document.getElementById('result-hair').src = imagePaths.hair + currentSelection.hair + '.png';
    document.getElementById('result-tops').src = imagePaths.tops + currentSelection.tops + '.png';
    document.getElementById('result-bottoms').src = imagePaths.bottoms + currentSelection.tops + '.png';
    document.getElementById('result-shoes').src = imagePaths.shoes + currentSelection.shoes + '.png';
    document.getElementById('result-accessory').src = imagePaths.accessory + currentSelection.accessory + '.png';

    document.getElementById('result-screen').style.display = 'flex';
}

function restartGame() {
    currentSelection = {
        hair: 1,
        tops: 1,
        bottoms: 1,
        shoes: 1,
        accessory: 1
    };

    document.getElementById('hair-layer').src = 'img/hair/hair1.png';
    document.getElementById('tops-layer').src = 'img/tops/tops1.png';
    document.getElementById('bottoms-layer').src = 'img/bottoms/bottoms1.png';
    document.getElementById('shoes-layer').src = 'img/shoes/shoes1.png';
    document.getElementById('accessory-layer').src = 'img/accessory/acc1.png';
    
    const allCategories = document.querySelectorAll('.category');
    allCategories.forEach(cat => {
        const buttons = cat.querySelectorAll('.option-btn');
        buttons.forEach((btn, index) => {
            if (index === 0) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    });
    
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', function() {
    preloadImages();
});

// 预加载图片
function preloadImages() {
    const images = [
        'img/base.png',
        'img/hair/hair1.png', 'img/hair/hair2.png', 'img/hair/hair3.png', 'img/hair/hair4.png',
        'img/tops/tops1.png', 'img/tops/tops2.png', 'img/tops/tops3.png', 'img/tops/tops4.png', 'img/tops/tops5.png',
        'img/bottoms/bottoms1.png', 'img/bottoms/bottoms2.png', 'img/bottoms/bottoms3.png', 'img/bottoms/bottoms4.png',
        'img/shoes/shoes1.png', 'img/shoes/shoes2.png', 'img/shoes/shoes3.png',
        'img/accessory/acc1.png', 'img/accessory/acc2.png', 'img/accessory/acc3.png', 'img/accessory/acc4.png'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}
