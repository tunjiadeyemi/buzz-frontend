import { getQuestions } from './api.js';

let timerInterval;
let totalTime = 60; // 60 seconds for the quiz
let pageContent = '';
let pageTitle = '';
let currentQuestionIndex = 0;
let currentQuiz = [];
let userAnswers = [];
let currentUser = { id: 'guest', email: 'guest@user.com' }; // default guest user
let showingLeaderboard = true; // start with leaderboard view
let selectedAI = 'cohere_ai'; // default AI provider
let geminiApiKey = ''; // store Gemini API key

async function saveScoreHistory(score, total, questions) {
  try {
    // Get existing history from localStorage
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');

    // Add new score to history
    history.unshift({
      title: pageTitle,
      score: score,
      total: total,
      time: 60 - totalTime,
      questions: questions,
      timestamp: new Date().toISOString(),
      provider: 'cohere_ai'
    });

    // Keep only last 50 entries
    if (history.length > 50) {
      history.splice(50);
    }

    // Save back to localStorage
    localStorage.setItem('quizHistory', JSON.stringify(history));

    await displayScoreHistory();
  } catch (error) {
    console.error('Error saving score:', error);
  }
}

// ui components
// function showAISelector() {
//   const quizContainer = document.getElementById('quizContainer');
//   quizContainer.innerHTML = `
//     <div class="ai-selector-container">
//       <h3 style="margin-bottom: 15px;">Select AI Provider</h3>
//       <div class="custom-select" id="customSelect">
//         <div class="select-selected" id="selectSelected">
//           <span id="selectedText">Cohere AI</span>
//           <span class="select-arrow">▼</span>
//         </div>
//         <div class="select-items" id="selectItems" style="display: none;">
//           <div class="select-option" data-value="cohere_ai">Cohere AI</div>
//           <div class="select-option" data-value="gemini_ai">Gemini AI</div>
//         </div>
//       </div>
//       // <div id="apiKeyContainer" style="display: none; margin-top: 15px; margin-bottom: 15px;">
//       //   <input type="text" id="geminiApiKey" placeholder="Enter Gemini API Key"
//       //          style="width: 100%; padding: 10px; font-size: 14px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;" />
//       // </div>
//     </div>
//     // <style>
//     //   .custom-select {
//     //     position: relative;
//     //     width: 100%;
//     //     margin-bottom: 10px;
//     //   }
//     //   .select-selected {
//     //     background-color: #fff;
//     //     padding: 10px 12px;
//     //     border: 1px solid #ddd;
//     //     border-radius: 6px;
//     //     cursor: pointer;
//     //     display: flex;
//     //     justify-content: space-between;
//     //     align-items: center;
//     //     font-size: 14px;
//     //     transition: all 0.2s ease;
//     //   }
//     //   .select-selected:hover {
//     //     border-color: #999;
//     //   }
//     //   .select-selected.active {
//     //     border-color: #666;
//     //     border-bottom-left-radius: 0;
//     //     border-bottom-right-radius: 0;
//     //   }
//     //   .select-arrow {
//     //     font-size: 10px;
//     //     transition: transform 0.2s ease;
//     //   }
//     //   .select-selected.active .select-arrow {
//     //     transform: rotate(180deg);
//     //   }
//     //   .select-items {
//     //     position: absolute;
//     //     background-color: #fff;
//     //     border: 1px solid #666;
//     //     border-top: none;
//     //     border-radius: 0 0 6px 6px;
//     //     width: 100%;
//     //     z-index: 99;
//     //     box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//     //   }
//     //   .select-option {
//     //     padding: 10px 12px;
//     //     cursor: pointer;
//     //     font-size: 14px;
//     //     transition: background-color 0.2s ease;
//     //   }
//     //   .select-option:hover {
//     //     background-color: #f0f0f0;
//     //   }
//     //   .select-option:last-child {
//     //     border-radius: 0 0 6px 6px;
//     //   }
//     // </style>
//   `;

//   const selectSelected = document.getElementById('selectSelected');
//   const selectItems = document.getElementById('selectItems');
//   const selectedText = document.getElementById('selectedText');
//   const apiKeyContainer = document.getElementById('apiKeyContainer');
//   const apiKeyInput = document.getElementById('geminiApiKey');

//   // Set initial value
//   const initialOption = selectedAI === 'cohere_ai' ? 'Cohere AI' : 'Gemini AI';
//   selectedText.textContent = initialOption;
//   if (selectedAI === 'gemini_ai') {
//     apiKeyContainer.style.display = 'block';
//     apiKeyInput.value = geminiApiKey;
//   }

//   // Toggle dropdown
//   selectSelected.addEventListener('click', (e) => {
//     e.stopPropagation();
//     selectSelected.classList.toggle('active');
//     if (selectItems.style.display === 'none') {
//       selectItems.style.display = 'block';
//     } else {
//       selectItems.style.display = 'none';
//     }
//   });

//   // Handle option selection
//   const options = document.querySelectorAll('.select-option');
//   options.forEach((option) => {
//     option.addEventListener('click', (e) => {
//       e.stopPropagation();
//       const value = option.getAttribute('data-value');
//       const text = option.textContent;

//       selectedAI = value;
//       selectedText.textContent = text;
//       selectItems.style.display = 'none';
//       selectSelected.classList.remove('active');

//       if (selectedAI === 'gemini_ai') {
//         apiKeyContainer.style.display = 'block';
//       } else {
//         apiKeyContainer.style.display = 'none';
//       }
//     });
//   });

//   // Close dropdown when clicking outside
//   document.addEventListener('click', (e) => {
//     if (!e.target.closest('.custom-select')) {
//       selectItems.style.display = 'none';
//       selectSelected.classList.remove('active');
//     }
//   });

//   apiKeyInput.addEventListener('input', (e) => {
//     geminiApiKey = e.target.value;
//   });
// }

async function generateQuiz() {
  userAnswers = []; // reset user answers

  const questions = pageContent.substring(0, 5000);

  const apiKey = selectedAI === 'gemini_ai' ? geminiApiKey : '';
  const response = await getQuestions({
    questions,
    pageTitle,
    type: selectedAI,
    apikey: apiKey
  });
  displayQuiz(response.questions);
}

document.addEventListener('DOMContentLoaded', async () => {
  const pageTitleElement = document.getElementById('pageTitle');
  const quizContainer = document.getElementById('quizContainer');
  const generateQuizButton = document.getElementById('generateQuiz');
  const signOutButton = document.getElementById('signOutButton');

  // show the generate quiz button immediately
  generateQuizButton.style.display = 'block';

  // show AI selector
  // showAISelector();

  // listen for messages from the injected script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PAGE_INFO') {
      pageTitle = message.title;
      pageTitleElement.textContent = `Quiz Title: ${pageTitle}`;
      pageContent = message.body;

      // enable the button since we have page content
      generateQuizButton.disabled = false;
    }
  });

  // inject script to get page content
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['inject.js']
      });
    }
  });

  // generate quiz button click handler
  generateQuizButton.addEventListener('click', async () => {
    // validate API key for Gemini
    if (selectedAI === 'gemini_ai' && !geminiApiKey.trim()) {
      alert('Please enter your Gemini API key');
      return;
    }

    generateQuizButton.disabled = true;
    generateQuizButton.textContent = 'Generating...';

    quizContainer.innerHTML =
      '<img src="buzz.svg" alt="Loading..." style="width: 60%; display: block; margin: 30px auto;">';

    try {
      await generateQuiz();
      // Reset button state on success
      generateQuizButton.disabled = false;
      generateQuizButton.textContent = 'Create Quiz';
    } catch (error) {
      console.error('Error generating quiz:', error);
      const errorMessage = error.message || error.toString();
      quizContainer.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <p style="color: #d32f2f; font-weight: bold; margin-bottom: 10px;">Failed to generate quiz</p>
          <p style="color: #666; font-size: 14px;">${errorMessage}</p>
        </div>
      `;
      generateQuizButton.disabled = false;
      generateQuizButton.textContent = 'Create Quiz';
      // Show AI selector again
      // showAISelector();
    }
  });

  // hide sign out button since we're not using auth
  signOutButton.style.display = 'none';
});

function startTimer() {
  const timerDisplay = document.getElementById('quizTimer');
  timerDisplay.textContent = `Time Left: ${totalTime}s`;

  timerInterval = setInterval(() => {
    totalTime--;
    timerDisplay.textContent = `Time Left: ${totalTime}s`;
    if (totalTime <= 0) {
      clearInterval(timerInterval);
      checkAnswers(currentQuiz, true); // auto-submit when time is up
    }
  }, 1000);
}

function displayQuiz(quiz) {
  const generateQuizButton = document.getElementById('generateQuiz');
  generateQuizButton.style.display = 'none';

  currentQuiz = quiz; // store the quiz
  totalTime = 60; // reset timer
  clearInterval(timerInterval);
  currentQuestionIndex = 0; // start from the first question

  const quizContainer = document.getElementById('quizContainer');
  quizContainer.innerHTML = `
    <div id="quizTimer" style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Time Left: 60s</div>
    <div id="quizContent"></div> 
    <div id="quizControls">
      <button id="prevQuestion" style="display:none;">Previous</button>
      <button id="nextQuestion">Next</button>
      <button id="submitQuizButton" style="display:none;">Submit</button>
    </div>
    <div id="quizResult" style="display: none;"></div>
  `;

  updateQuestionDisplay();

  document.getElementById('nextQuestion').addEventListener('click', () => changeQuestion(1));
  document.getElementById('prevQuestion').addEventListener('click', () => changeQuestion(-1));
  document
    .getElementById('submitQuizButton')
    .addEventListener('click', () => checkAnswers(currentQuiz, false));

  startTimer();
}

function updateQuestionDisplay() {
  const quizContent = document.getElementById('quizContent');
  quizContent.classList.add('quizContainer');
  const question = currentQuiz[currentQuestionIndex];

  quizContent.innerHTML = `
    <div style="text-align: center; font-size: 14px; color: #666; margin-bottom: 10px; font-weight: 500;">
      Question ${currentQuestionIndex + 1}/${currentQuiz.length}
    </div>
    <p style="font-size: 17px; font-weight: bold; margin-bottom: 15px;">${
      currentQuestionIndex + 1
    }. ${question.question}</p>
    <div style="display: flex; flex-direction: column; gap: 1px;">
      ${question.options
        .map(
          (option, i) => `
        <label>
          <input type="radio" name="q${currentQuestionIndex}" value="${option}" 
                ${userAnswers[currentQuestionIndex] === option ? 'checked' : ''}>
          <span style="font-size: 15px;">${option}</span>
        </label><br>
      `
        )
        .join('')}
      </div>
  `;

  // add event listeners to radio buttons
  const radioButtons = quizContent.querySelectorAll('input[type="radio"]');
  radioButtons.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      userAnswers[currentQuestionIndex] = e.target.value;
    });
  });

  // show/hide navigation buttons
  document.getElementById('prevQuestion').style.display =
    currentQuestionIndex === 0 ? 'none' : 'inline-block';
  document.getElementById('nextQuestion').style.display =
    currentQuestionIndex === currentQuiz.length - 1 ? 'none' : 'inline-block';
  document.getElementById('submitQuizButton').style.display =
    currentQuestionIndex === currentQuiz.length - 1 ? 'inline-block' : 'none';

  document.getElementById('submitQuizButton').classList.add('quiz-button');
  document.getElementById('nextQuestion').classList.add('quiz-button');
  document.getElementById('prevQuestion').classList.add('quiz-button');
}

function changeQuestion(direction) {
  currentQuestionIndex += direction;
  updateQuestionDisplay();
}

function checkAnswers(quiz, autoSubmit) {
  if (!autoSubmit) {
    const submitButton = document.getElementById('submitQuizButton');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
  }

  // hide generate quiz button after successful auth
  const generateQuizButton = document.getElementById('generateQuiz');
  generateQuizButton.style.display = 'none';

  clearInterval(timerInterval);
  let score = 0;
  let reviewHtml = '<h3 style="font-size: 20px; margin: 10px 0;">Review:</h3>';

  quiz.forEach((q, index) => {
    const userAnswer = userAnswers[index];
    if (userAnswer) {
      if (userAnswer === q.answer) {
        score++;
        reviewHtml += `<div style='font-size: 15px; color:green; margin: 10px 0;'>✔ ${q.question} <br /> - ${userAnswer} <br /> - Correct</div>`;
      } else {
        reviewHtml += `<div style='font-size: 15px; color:red; margin: 10px 0;'>✘ ${q.question} <br /> - ${userAnswer} <br /> - Correct Answer: ${q.answer}</div>`;
      }
    } else {
      reviewHtml += `<div style='font-size: 15px; color:red; margin: 10px 0;'>✘ ${q.question} <br /> - No answer selected <br /> - Correct Answer: ${q.answer}</div>`;
    }
  });

  const resultContainer = document.getElementById('quizResult');
  resultContainer.style.display = 'block';
  resultContainer.innerHTML = `
    <p style="font-size: 14px; font-weight: 600;">Your Score: ${score}/${quiz.length}</p>
    ${reviewHtml}
    <button id="tryAgainButton" class="quiz-button">Regenerate</button>
  `;

  document.getElementById('quizContent').style.display = 'none';
  document.getElementById('tryAgainButton').addEventListener('click', async () => {
    const tryAgainButton = document.getElementById('tryAgainButton');
    tryAgainButton.disabled = true;
    tryAgainButton.textContent = 'Loading...';

    try {
      document.getElementById('quizContainer').innerHTML =
        '<img src="buzz.svg" alt="Loading..." style="width: 60%; display: block; margin: 30px auto;">';
      await generateQuiz();
    } catch (error) {
      console.error('Error generating new quiz:', error);
      tryAgainButton.disabled = false;
      tryAgainButton.textContent = 'Try Again';
    }
  });

  // hide submit button after submission
  document.getElementById('submitQuizButton').style.display = 'none';
  document.getElementById('nextQuestion').style.display = 'none';
  document.getElementById('prevQuestion').style.display = 'none';

  saveScoreHistory(score, quiz.length, quiz);
  displayScoreHistory();
}

async function displayScoreHistory() {
  const historyContainer = document.getElementById('scoreHistory');
  const viewHistoryButton = document.getElementById('viewHistory');

  // Hide the view history button since we only show one view now
  if (viewHistoryButton) {
    viewHistoryButton.style.display = 'none';
  }

  try {
    // Get history from localStorage
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');

    historyContainer.innerHTML = `
      <h3>My Quiz History</h3>
      <div class="table-container">
        <table class="scores-table">
          <thead>
            <tr>
              <th>Quiz</th>
              <th>Score</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${
              history.length > 0
                ? history
                    .map(
                      (entry, index) => `
              <tr>
                <td>${entry.title}</td>
                <td>${entry.score}/${entry.total}</td>
                <td>${entry.time}s</td>
                <td>
                  <button class="retake-button history-button" data-index="${index}">Retake</button>
                </td>
              </tr>
            `
                    )
                    .join('')
                : '<tr><td colspan="4">No quiz history found</td></tr>'
            }
          </tbody>
        </table>
      </div>
    `;

    const retakeButtons = document.querySelectorAll('.retake-button');
    retakeButtons.forEach((button) => {
      button.addEventListener('click', async () => {
        const index = parseInt(button.getAttribute('data-index'));
        const entry = history[index];

        if (entry && entry.questions) {
          try {
            let questions = entry.questions;

            // set title to match the original quiz
            pageTitle = entry.title;
            document.getElementById('pageTitle').textContent = `Quiz Title: ${pageTitle}`;

            // display the quiz with the questions from history
            displayQuiz(questions);

            // scroll to the top of the quiz
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (error) {
            console.error('Error retaking quiz:', error);
            alert('Failed to load the quiz. Please try again.');
          }
        } else {
          alert('Quiz questions not found for this entry.');
        }
      });
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    historyContainer.innerHTML = `<p class="error">Error loading history</p>`;
  }
}

document.addEventListener('DOMContentLoaded', displayScoreHistory);
