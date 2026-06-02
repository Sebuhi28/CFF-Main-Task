import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../components_css/QuizPage.css";

function formatCategoryName(slug) {
  return slug.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getHintCount(difficulty) {
  if (difficulty === "easy") {
    return 2;
  }
  if (difficulty === "hard") {
    return 0;
  }
  return 1;
}

function getTimerValue(difficulty, timerValue) {
  if (difficulty === "hard" && timerValue === "none") {
    return "15";
  }
  return timerValue;
}

export default function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const categorySlug = queryParams.get("category") || "general_knowledge";
  const difficulty = queryParams.get("difficulty") || "medium";
  const timerValue = queryParams.get("timer") || "30";
  const effectiveTimer = getTimerValue(difficulty, timerValue);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [hintCount, setHintCount] = useState(getHintCount(difficulty));
  const [removedOptions, setRemovedOptions] = useState([]);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(effectiveTimer === "none" ? null : parseInt(effectiveTimer, 10));
  const [questionResults, setQuestionResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      setError("");
      setCurrentIndex(0);
      setSelectedOption(null);
      setRemovedOptions([]);
      setScore(0);
      setHintCount(getHintCount(difficulty));
      setQuestionResults([]);
      setTimeLeft(effectiveTimer === "none" ? null : parseInt(effectiveTimer, 10));

      try {
        const response = await fetch(`/api/quiz/${categorySlug}`);
        if (!response.ok) {
          throw new Error("Failed to load quiz questions.");
        }
        const data = await response.json();
        setQuestions(data);
      } catch (fetchError) {
        setError("Could not load quiz questions. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [categorySlug, difficulty, effectiveTimer]);

  useEffect(() => {
    if (effectiveTimer === "none" || questions.length === 0) {
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous === null) {
          return null;
        }
        if (previous <= 1) {
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [effectiveTimer, questions.length]);

  useEffect(() => {
    if (timeLeft === 0 && effectiveTimer !== "none" && questions.length) {
      handleSkip();
    }
  }, [timeLeft]);

  useEffect(() => {
    setSelectedOption(null);
    setRemovedOptions([]);
    setAnswerSubmitted(false);
    setAnswerCorrect(false);
    if (effectiveTimer !== "none") {
      setTimeLeft(parseInt(effectiveTimer, 10));
    }
  }, [currentIndex, effectiveTimer]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions === 0 ? 0 : Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleOptionClick = (index) => {
    setSelectedOption(index);
  };

  const goToNextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      const resultState = {
        categorySlug,
        difficulty,
        score,
        totalQuestions,
        percentage: totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100),
        correctCount: score,
        incorrectCount: totalQuestions - score,
        results: questionResults,
        timer: effectiveTimer,
      };
      try {
        sessionStorage.setItem("quizResultState", JSON.stringify(resultState));
      } catch (error) {
        // ignore errors when storage is unavailable
      }
      navigate("/result", { state: resultState });
      return;
    }
    setCurrentIndex(nextIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !currentQuestion) {
      return;
    }

    const correct = selectedOption === currentQuestion.correctAnswer;
    setAnswerCorrect(correct);
    setAnswerSubmitted(true);

    if (correct) {
      setScore(score + 1);
    }

    const newResult = {
      question: currentQuestion.question,
      userAnswer: currentQuestion.options[selectedOption],
      correctAnswer: currentQuestion.options[currentQuestion.correctAnswer],
      correct,
      skipped: false,
    };
    setQuestionResults([...questionResults, newResult]);
  };

  function handleSkip() {
    if (difficulty === "hard") {
      return;
    }

    if (currentQuestion) {
      const newResult = {
        question: currentQuestion.question,
        userAnswer: "Skipped",
        correctAnswer: currentQuestion.options[currentQuestion.correctAnswer],
        correct: false,
        skipped: true,
      };
      setQuestionResults([...questionResults, newResult]);
    }

    goToNextQuestion();
  }

  const handleHint = () => {
    if (hintCount <= 0 || !currentQuestion) {
      return;
    }

    const wrongIndexes = currentQuestion.options
      .map((_, index) => index)
      .filter((index) => index !== currentQuestion.correctAnswer);

    const selectedRemovals = wrongIndexes.slice(0, 2);
    setRemovedOptions(selectedRemovals);
    setHintCount(Math.max(hintCount - 1, 0));
  };

  const handleQuit = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <main className="quiz-main-content">
        <div className="question-card">
          <p>Loading quiz...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="quiz-main-content">
        <div className="quiz-error">{error}</div>
      </main>
    );
  }

  const visibleOptions = [];
  if (currentQuestion) {
    for (let index = 0; index < currentQuestion.options.length; index += 1) {
      if (!removedOptions.includes(index)) {
        visibleOptions.push({ option: currentQuestion.options[index], index });
      }
    }
  }

  return (
    <main className="quiz-main-content">
      <div className="quiz-header">
        <button className="quiz-back-button" onClick={handleQuit}>
          ← Quit Quiz
        </button>
        <div className="quiz-category-chip">
          <span>{formatCategoryName(categorySlug)}</span>
          <small>{difficulty.toUpperCase()}</small>
        </div>
      </div>

      <div className="quiz-stats-grid">
        <div className="stat-card">
          <p className="stat-title">Question {currentIndex + 1} of {totalQuestions}</p>
          <div className="stat-value">
            <span>{progress}% complete</span>
            <small>Score {score}</small>
          </div>
          <div className="progress-track" style={{ marginTop: 12 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="timer-card">
          <span>{effectiveTimer === "none" ? "∞" : timeLeft}</span>
          <small style={{ marginLeft: 12 }}>{effectiveTimer === "none" ? "No timer" : "Seconds"}</small>
        </div>
      </div>

      <section className="question-card">
        <h2>{currentQuestion ? currentQuestion.question : "No question available."}</h2>
        <p className="question-subtitle">Select the correct answer</p>

        <div className="options-grid">
          {visibleOptions.map(({ option, index }) => {
            const isCorrect = answerSubmitted && index === currentQuestion.correctAnswer;
            const isWrong = answerSubmitted && selectedOption === index && index !== currentQuestion.correctAnswer;
            return (
              <button
                key={index}
                className={`option-button ${selectedOption === index ? "selected" : ""} ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                onClick={() => handleOptionClick(index)}
                disabled={answerSubmitted}
              >
                {option}
              </button>
            );
          })}
        </div>

        {answerSubmitted && (
          <div className={`answer-feedback ${answerCorrect ? "correct-feedback" : "wrong-feedback"}`}>
            {answerCorrect ? "Correct!" : `Incorrect. The right answer is ${currentQuestion.options[currentQuestion.correctAnswer]}.`}
          </div>
        )}

        <div className="action-row">
          <div className="action-group">
            <button className="secondary-button" onClick={handleHint} disabled={hintCount <= 0 || answerSubmitted}>
              Hint ({hintCount})
            </button>
            <button className="secondary-button" onClick={handleSkip} disabled={difficulty === "hard" || answerSubmitted}>
              Skip
            </button>
          </div>
          {!answerSubmitted ? (
            <button className="primary-button" onClick={handleSubmit} disabled={selectedOption === null}>
              Submit Answer
            </button>
          ) : (
            <button className="primary-button" onClick={goToNextQuestion}>
              Next Question
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
