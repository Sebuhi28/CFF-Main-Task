import { useLocation, useNavigate } from "react-router-dom";
import "../components_css/ResultPage.css";

function formatCategoryName(slug) {
  return slug.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPercentage(score, totalQuestions) {
  if (totalQuestions === 0) {
    return 0;
  }
  return Math.round((score / totalQuestions) * 100);
}

function getResultMessage(percentage) {
  if (percentage >= 85) {
    return "Excellent work!";
  }
  if (percentage >= 65) {
    return "Great job!";
  }
  if (percentage >= 45) {
    return "Not Bad!";
  }
  return "Keep practicing and try again!";
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  let state = location.state || {};

  if (!state || Object.keys(state).length === 0) {
    try {
      const stored = sessionStorage.getItem("quizResultState");
      if (stored) {
        state = JSON.parse(stored);
      }
    } catch (error) {
      state = {};
    }
  }

  const categorySlug = state.categorySlug || "general_knowledge";
  const difficulty = state.difficulty || "medium";
  const score = Number.isFinite(state.score) ? state.score : 0;
  const totalQuestions = Number.isFinite(state.totalQuestions) ? state.totalQuestions : 0;
  const percentage = Number.isFinite(state.percentage) ? state.percentage : getPercentage(score, totalQuestions);
  const results = Array.isArray(state.results) ? state.results : [];
  const incorrectCount = Number.isFinite(state.incorrectCount) ? state.incorrectCount : totalQuestions - score;
  const categoryName = formatCategoryName(categorySlug);
  const message = getResultMessage(percentage);

  if (totalQuestions === 0) {
    return (
      <main className="result-main-content">
        <div className="result-summary-panel">
          <h1 className="summary-title">Quiz results are not available.</h1>
          <p className="summary-text">Return to the home page and start a quiz to see your performance summary.</p>
          <div className="result-actions">
            <button className="secondary-button" onClick={() => navigate("/")}>Back to Dashboard</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="result-main-content">
      <section className="result-summary-panel">
        <div className="result-summary-header">
          <div className="result-summary-icon">🏆</div>
          <div>
            <p className="summary-status">Quiz Complete!</p>
            <h1 className="summary-title">{categoryName}</h1>
            <p className="summary-text">{message}</p>
          </div>
        </div>

        <div className="result-score-badge">{percentage}%</div>
        <p className="result-summary-subtitle">You answered {score} of {totalQuestions} questions correctly.</p>

        <div className="result-stats-grid">
          <div className="result-card">
            <p className="result-stat-title">Total Questions</p>
            <p className="result-stat-value">{totalQuestions}</p>
          </div>
          <div className="result-card">
            <p className="result-stat-title">Correct</p>
            <p className="result-stat-value">{score}</p>
          </div>
          <div className="result-card">
            <p className="result-stat-title">Incorrect / Skipped</p>
            <p className="result-stat-value">{incorrectCount}</p>
          </div>
        </div>

        <div className="result-actions">
          <button className="secondary-button" onClick={() => navigate("/")}>Back to Dashboard</button>
          <button className="primary-button" onClick={() => navigate(`/quiz?category=${categorySlug}&difficulty=${difficulty}&timer=${state.timer || "30"}`)}>
            Play Again
          </button>
        </div>
      </section>

      <section className="analytics-panel">
        <h2>Detailed Analytics</h2>
        {results.length > 0 ? (
          results.map((item, index) => (
            <div key={index} className={`analytics-item ${item.correct ? "correct" : "incorrect"}`}>
              <div className="analytics-header">
                <span className="analytics-status">{item.correct ? "✔" : "✕"}</span>
                <div>
                  <h3 className="analytics-question">{item.question}</h3>
                </div>
              </div>
              <div className="analytics-answers">
                <div className="answer-block your-answer">
                  <span>Your Answer</span>
                  <div>{item.userAnswer}</div>
                </div>
                {!item.correct && (
                  <div className="answer-block correct-answer">
                    <span>Correct Answer</span>
                    <div>{item.correctAnswer}</div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="analytics-empty">No detailed analytics are available for this quiz.</div>
        )}
      </section>
    </main>
  );
}

