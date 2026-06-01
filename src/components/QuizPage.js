import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../components_css/QuizPage.css";
import logo from "../assets/logo.png";

function formatCategoryName(slug) {
  return slug
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const categorySlug = queryParams.get("category") || "general_knowledge";
  const difficulty = queryParams.get("difficulty") || "medium";
  const timerValue = queryParams.get("timer") || "30";
  const effectiveTimer = difficulty === "hard" && timerValue === "none" ? "15" : timerValue;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [hintCount, setHintCount] = useState(difficulty === "easy" ? 2 : difficulty === "hard" ? 0 : 1);
  const [removedOptions, setRemovedOptions] = useState([]);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(effectiveTimer === "none" ? null : parseInt(effectiveTimer, 10));
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    setFinished(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setRemovedOptions([]);
    setScore(0);
    setHintCount(difficulty === "easy" ? 2 : difficulty === "hard" ? 0 : 1);
    setTimeLeft(effectiveTimer === "none" ? null : parseInt(effectiveTimer, 10));

    const loadQuiz = async () => {
      const endpoints = [
        `/api/quiz/${categorySlug}`,
        `http://localhost:5000/api/quiz/${categorySlug}`,
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          const text = await response.text();
          const contentType = response.headers.get("content-type") || "";

          if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${text}`);
          }

          if (!contentType.includes("application/json")) {
            throw new Error(`Non-JSON response from ${endpoint}`);
          }

          return JSON.parse(text);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (endpoint.includes("localhost:5000")) {
            throw new Error(message);
          }
          // Try the next endpoint if the current one failed.
        }
      }

      throw new Error("Could not load quiz questions from any endpoint.");
    };

    loadQuiz()
      .then((data) => {
        setQuestions(data);
      })
      .catch((fetchError) => {
        setError(
          fetchError.message ||
            "Something went wrong while loading questions. Ensure the backend is running and restart the frontend if needed."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categorySlug, difficulty, timerValue, effectiveTimer]);

  useEffect(() => {
    if (effectiveTimer === "none" || finished || !questions.length) {
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
  }, [effectiveTimer, finished, questions.length]);

  useEffect(() => {
    if (timeLeft === 0 && effectiveTimer !== "none" && questions.length && !finished) {
      handleSkip();
    }
  }, [timeLeft, effectiveTimer, finished, questions.length]);

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
  const progress = totalQuestions ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const handleOptionClick = (index) => {
    setSelectedOption(index);
  };

  const goToNextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      setFinished(true);
      return;
    }
    setCurrentIndex(nextIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !currentQuestion) return;

    const correct = selectedOption === currentQuestion.correctAnswer;
    setAnswerCorrect(correct);
    setAnswerSubmitted(true);
    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    if (difficulty === "hard") {
      return;
    }
    goToNextQuestion();
  };

  const handleHint = () => {
    if (hintCount <= 0 || !currentQuestion) return;

    const wrongIndexes = currentQuestion.options
      .map((_, index) => index)
      .filter((index) => index !== currentQuestion.correctAnswer);

    const selectedRemovals = wrongIndexes.slice(0, 2);
    setRemovedOptions(selectedRemovals);
    setHintCount((prev) => Math.max(prev - 1, 0));
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

  if (finished) {
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

        <div className="quiz-summary-panel">
          <h1 className="summary-title">Quiz Complete</h1>
          <p className="summary-text">Nice work! You have completed the quiz.</p>
          <div className="summary-score">Score: {score} / {totalQuestions}</div>
          <div className="summary-actions">
            <button className="primary-button" onClick={() => navigate("/")}>
              Return Home
            </button>
            <button className="secondary-button" onClick={() => window.location.reload()}>
              Play Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const visibleOptions = currentQuestion
    ? currentQuestion.options
        .map((option, index) => ({ option, index }))
        .filter(({ index }) => !removedOptions.includes(index))
    : [];

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
        <h2>{currentQuestion?.question}</h2>
        <p className="question-subtitle">Select the correct answer</p>

        <div className="options-grid">
          {visibleOptions.map(({ option, index }) => {
            const isCorrect = answerSubmitted && index === currentQuestion.correctAnswer;
            const isWrong = answerSubmitted && selectedOption === index && index !== currentQuestion.correctAnswer;
            return (
              <button
                key={index}
                className={`option-button ${selectedOption === index ? "selected" : ""} ${
                  isCorrect ? "correct" : ""
                } ${isWrong ? "wrong" : ""}`}
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
