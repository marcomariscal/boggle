class BoggleGame {
  constructor(gameId, seconds = 60) {
    this.gameId = "#" + gameId;
    this.timer(seconds);
    this.seconds = seconds;
    this.score = 0;
    this.guessedWords = [];
    this.gameOver = false;

    $("#guess-form").on("submit", this.handleWordCheck.bind(this));
  }

  // send the word to the server to check if it's a valid word
  async handleWordCheck(e) {
    e.preventDefault();
    if (this.gameOver) return;

    const guess = $("#guess-input").val();

    // multiple checks for a valid input
    if (!guess) return;
    if (guess.length < 2) return; // word should be longer than one character
    if (this.guessedWords.includes(guess)) {
      alert("already guessed that word!");
      return;
    }

    this.guessedWords.push(guess);

    const response = await axios.get(`/guess`, {
      params: { guess: guess }
    });

    if (!response) {
      throw new Error("Please guess a word again!");
    }

    const result = response.data.result;

    this.updateScore(result, guess);
    this.displayScore(result);

    $("#guess-form").trigger("reset");

    return result;
  }

  updateScore(result, guess) {
    if (!result) return;
    this.score = result === "ok" ? this.score + guess.length : this.score;
  }

  displayScore(result) {
    $("#guess-word-result").html(`<p>${result}</p>`);
    $("#score-display").html(`<p>${this.score}</p>`);
  }

  timer(seconds) {
    let remainTime = Date.now() + seconds * 1000;
    let intervalTimer = setInterval(() => {
      let timeLeft = Math.round((remainTime - Date.now()) / 1000);
      if (timeLeft < 0) {
        clearInterval(intervalTimer);
        this.endGameDisplay();
        this.gameOver = true;
        return;
      }
      $("#timer").html(`<p>Time left: ${timeLeft}</p>`);
    });
  }

  async endGameDisplay() {
    const { highscore, plays } = await this.postScore();

    $("#final-results").html(`
        <p>Your score was ${this.score}!</p>
        <p>Your high score is ${highscore} and you played ${plays} ${
      plays === 1 ? "time" : "times"
    }!</p> 
        `);
  }

  async postScore() {
    const response = await axios.post("/score", { score: this.score });

    if (!response) {
      throw new Error("something went wrong with storing your score");
    }

    const { highscore, plays } = response.data;
    return { highscore, plays };
  }
}
