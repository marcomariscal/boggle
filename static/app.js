$(async function() {
  let score = 0;
  let guessedWords = [];
  let gameOver = false;
  $playAgainBtn = $("#play-again");
  $playAgainBtn.hide();
  $playAgainBtn.on("click", restartGame);

  timer(60);
  $("#guess-form").on("submit", checkWordOnSubmit);

  async function checkWordOnSubmit(e) {
    if (gameOver) return;
    e.preventDefault();

    const guess = $("#guess-input").val();
    if (!guess) return;
    if (guess.length < 2) return; // word should be longer than one character
    if (guessedWords.includes(guess)) {
      alert("already guessed that word!");
      return;
    }

    guessedWords.push(guess);

    const response = await axios.get(`/guess`, {
      params: { guess: guess }
    });

    if (!response) {
      throw new Error("Please guess a word again!");
    }

    const result = response.data.result;

    displayCheckWordResult(result);
    updateScore(result, guess);
    displayScore();

    $(this).trigger("reset");

    return result;
  }

  function displayCheckWordResult(result) {
    $guessResult = $("#guess-word-result");
    $guessResult.empty();
    $guessResult.append($("<p>").text(`${result}`));
  }

  function updateScore(result, guess) {
    if (!result) return;

    if (result === "ok") {
      score += guess.length;
    } else {
      return;
    }
  }

  function displayScore() {
    $("#score-display").html(`<p>${score}</p>`);
  }

  function timer(seconds) {
    let remainTime = Date.now() + seconds * 1000;
    let intervalTimer = setInterval(() => {
      let timeLeft = Math.round((remainTime - Date.now()) / 1000);
      if (timeLeft < 0) {
        clearInterval(intervalTimer);
        endGame();
        return;
      }
      $("#timer").html(`<p>${timeLeft}</p>`);
    });
  }

  async function endGame() {
    gameOver = true;
    let { highscore, plays } = await postScore();

    $("#guess-form").empty();
    $("#guess-form").html(`
        <h1>Your score was ${score}!</h1>
        <h3>Your high score is ${highscore} and you played ${plays} ${plays === 1 ? "time" : "times"}!</h3> 
        `);
    $playAgainBtn.show();
  }

  async function postScore() {
    const response = await axios.post("/score", { score: score });

    if (!response) {
      throw new Error("something went wrong with storing your score");
    }

    let { highscore, plays } = response.data;
    return { highscore, plays };
  }

  function restartGame() {
    score = 0;
    guessedWords = [];
  }
});
