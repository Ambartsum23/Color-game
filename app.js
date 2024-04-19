// დომ-ის ერთი ელემენტის სელექტორის მონიშვნის ფუნქცია 
const getElement = (selector) => document.querySelector(selector);

// დომ-ის ყველა ელემენტის სელექტორის მონიშვნის ფუნქცია 
const getElements = (selector) => document.querySelectorAll(selector);

const scoreDisplay = getElement("#score"); // ქულა
const colorDisplay = getElement("#color"); // მიმდინარე ფერი
const easyBtn = getElement(".easy"); // იზი ლეველის ღილაკი 
const mediumBtn = getElement(".medium"); // მედიუმ ლეველის ღილაკი 
const hardBtn = getElement(".hard"); // ჰარდ ლეველის ღილაკი 
const resetBtn = getElement(".reset"); // თამაშის გადათვიღთვის ღილაკი
const boxArray = getElements(".box"); // ყველა გეფერადებული ბლოკის მასივი 
const firstRow = getElements(".first"); // პირველი რიგი ბლოკების 
const secondRow = getElements(".second"); // მეორე რიგი ბლოკები 
const thirdRow = getElements(".third"); // მესამე რიგი გაფერადებლი რიგების 

let currentMode = ''; // მიმდინარე თამაშის რეჯიმის ცვლად
let currentAnswer = -1; // სწორი პასუხის ინდექსი 
let score = 0; // მოთამაშეს მიმდინარე ქულა

// ფერის შერჩევის მერე ეკრანზე გამოჩენის მესიჯი 
const displayMessage = (title, text, isSuccess, color) => {
  let footer = '';
  if (color) {
    footer = `<span>${color}</span>`;
  }
  Swal.fire({
    title,
    html: `<div style="${color}">${text}</div>`,
    icon: isSuccess ? 'success' : 'error',
    confirmButtonText: 'OK'
  });
};

// თამაშის გადატვირთვა
function resetGame(isAllowed = false) {
  currentMode = '';
  currentAnswer = -1;
  score = 0;
  scoreDisplay.textContent = score;
  colorDisplay.textContent = 'None';
  boxArray.forEach(element => {
    setCursorelement(element, 'not-allowed');
    setBackgroundColor(element);
    setHover(element, false);
  });
  if (!isAllowed) {
    displayAlert('Wrong config', 'error', 'Restarting the game');
  }
}

// ელემენთზე მოქმედი მოვლენის შემუშავების ფუნქცია 
const addEventListenerTo = (element, event, callback) => {
  element.addEventListener(event, callback);
};

// ახალი თამაშს დაწყების ფუნქცია მითითებულ რეჟიმში 
const startGame = (mode) => {
  currentMode = mode; //  მიმდინარე რეჟიმის განსაზღვრა  

  // თუ არჩეული რეჟიმი არ არის იზი მედიუმ ჰარდ მაშინ თამაში გადაითვიღთხება 
  if (!['easy', 'medium', 'hard'].includes(currentMode)) return resetGame();
  initStyle(); // თამაშის სტილის ინიცალიზაცია 
  const count = currentMode === "easy" ? 3 : (currentMode === "medium" ? 6 : 9); // გაფერედებული ბლოკების რაოდენობის შემოწმება
  const colorsArray = getRandomColors(count); // მასივივი შემთხვევითი ფერებით  
  const answer = randomIndex(count); // მასივიდან შემთხვევითი ერთერთი ელემეტის არჩევა რომელიც ექნება სწორი პასუხი

  // ფერის დადება ყველა ბელოკზე  შესაბამის არჩეულ რეჟიმთან
  [firstRow, secondRow, thirdRow].forEach((row, index) => {
    row.forEach((element, i) => {
      setBackgroundColor(element, colorsArray[i + (index * 3)]);
    });
  });
  currentAnswer = answer; //ინდექსის განსაძღვრა სწორი პასუხისთვის  
  colorDisplay.textContent = colorsArray[answer]; // მიმდინარე ფერის გამოჩენა 
};

//  არჩეული ვარიანტის შემოწმება
const checkValidAnswer = (index) => {
  if (!['easy', 'medium', 'hard'].includes(currentMode)) return;
  const count = currentMode === "easy" ? 3 : (currentMode === "medium" ? 6 : 9); 
  // არჩეული პასუხის შემოწმება
  if (index !== currentAnswer) {
    setScore(currentMode, false); // ქულის დაკლება
    return displayMessage('Try again.', false); // არასწორი პასუხის შესახებ წერილი 
  }
  setScore(currentMode, true); // ქულის დამათება 
  displayMessage('You guessed the color.', colorDisplay.textContent, true); // სწორი პასუხის მესიჯი 
  
  setTimeout(() => startGame(currentMode), 1500);
};

// ქულების განსაღვრის ფუნქცია
const setScore = (mode = 'easy', hasWon = false) => {
  if (mode === "easy") {
    score += hasWon ? 10 : -5;
  } else if (mode === "medium") {
    score += hasWon ? 20 : -10;
  } else {
    score += hasWon ? 30 : -15;
  }
  score = Math.max(score, 0);
  scoreDisplay.textContent = score;
};

// სტილების განსაძვრის ფუნქცია
const initStyle = () => {
  // ყველა ფერადი ბლოკის სტილების გაუქმება
  boxArray.forEach(element => {
    setHover(element, false);
  });

  [firstRow, secondRow, thirdRow].forEach((row, index) => {
    row.forEach((element) => {
      const cursor = index === 0 ? 'pointer' : (currentMode === 'easy' ? 'not-allowed' : 'pointer');
      const hover = index === 0;
      setCursorelement(element, cursor);
      setBackgroundColor(element);
      setHover(element, hover);
    });
  });
};
// შემთხვევითი რგბ  ფერის გენერაცია 
const getRandomRGB = () => `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`;

// ფუნკცია შემთხვევითი ფერების მასივის გენერაცია 
const getRandomColors = (count = 3) => {
  const array = [];
  for (let i = 0; i < count; i++) {
    array.push(getRandomRGB());
  }
  return array;
};

// შემთხვევითი ინდექსის გენერაცია
const randomIndex = (count) => Math.floor(Math.random() * count);
addEventListenerTo(easyBtn, 'click', () => startGame('easy'));
addEventListenerTo(mediumBtn, 'click', () => startGame('medium'));
addEventListenerTo(hardBtn, 'click', () => startGame('hard'));
addEventListenerTo(resetBtn, 'click', () => {resetGame(true);});

// ფერად ბლოკებზე მოვლენების შემუშავება
boxArray.forEach((element, index) => {
  addEventListenerTo(element, 'click', () => checkValidAnswer(index));
});

// ბლოკზე ჰოვერ ეფეკტის დადება 
const setHover = (element, set = false) => {
  element.classList.toggle('hover', set);
};

const setCursorelement = (element, cursor = "pointer") => {
  element.style.cursor = cursor;
};

// ბლოკებზე ბექგრაუნდ ფერის  განსაზღვა თავიადნ გამჭვირვალე ფონი აქვს
const setBackgroundColor = (element, bgColor = 'transparent') => {
  element.style.backgroundColor = bgColor;
};