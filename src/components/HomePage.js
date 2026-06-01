import "../components_css/HomePage.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import anime from "../assets/anime.png";
import brain from "../assets/brain.png";

import genknow from "../assets/genknow.png";
import geography from "../assets/geography.png";
import history from "../assets/history.png";
import javascript from "../assets/javascript.png";
import movies from "../assets/movies.png";
import science from "../assets/science.png";




export default function HomePage() {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [difficulty, setDifficulty] = useState("medium");
    const [timer, setTimer] = useState("30");
    const navigate = useNavigate();

    const categories = [
        { name: "Anime", slug: "anime", image: anime, description: "Test your anime knowledge and trivia", questions: 10 },
        { name: "General Knowledge", slug: "general_knowledge", image: genknow, description: "A mix of trivia across subjects", questions: 10 },
        { name: "Geography", slug: "geography", image: geography, description: "Maps, capitals and places", questions: 10 },
        { name: "History", slug: "history", image: history, description: "Historical events and figures", questions: 10 },
        { name: "JavaScript", slug: "javascript", image: javascript, description: "Language quirks and APIs", questions: 10 },
        { name: "Movies", slug: "movies", image: movies, description: "Film trivia and actors", questions: 10 },
        { name: "Science", slug: "science", image: science, description: "Test your knowledge of scientific facts and discoveries", questions: 10 }
    ];

    const handleConfigure = (category) => {
        setSelectedCategory(category);
        setDifficulty("medium");
        setTimer("30");
    };

    useEffect(() => {
        if (difficulty === "hard" && timer === "none") {
            setTimer("15");
        }
    }, [difficulty, timer]);

    const handleStartQuiz = () => {
        if (!selectedCategory) return;
        navigate(`/quiz?category=${selectedCategory.slug}&difficulty=${difficulty}&timer=${timer}`);
    };

    return (
        <>
            <header className="home-header">
                <div className="logo-div">
                    <img src={logo} alt="Logo" className="logo" />
                    <h1 className="app-name">QuizMaster</h1>
                </div>
            </header>
            <main className="home-main-content">
                <div className="welcome-div">
                    <div className="welcome-header">
                        <img src={brain} alt="Brain" className="brain-image" />
                        <h1 className="welcome-message">Welcome to QuizMaster!</h1>
                    </div>
                    <p className="welcome-description">Choose a category, set your difficulty, and test your knowledge to earn points and badges.</p>
                </div>

                <section className="categories-section">
                    <div className="categories">
                        {
                            categories.map((category, index) => (
                                <div className="category-card" key={index}>
                                    <div className="category-card-top">
                                        <img src={category.image} alt={category.name} className="category-image" />
                                        <span className="category-badge">{category.questions} questions</span>
                                    </div>
                                    <div className="category-card-body">
                                        <h3 className="category-name">{category.name}</h3>
                                        <p className="category-description">{category.description}</p>
                                    </div>
                                    <button className="category-action-button" onClick={() => handleConfigure(category)}>
                                        Configure Quiz
                                    </button>
                                </div>
                            ))
                        }
                    </div>
                </section>

                {selectedCategory && (
                    <div className="settings-overlay" onClick={() => setSelectedCategory(null)}>
                        <section className="settings-panel" onClick={(event) => event.stopPropagation()}>
                            <div className="settings-panel-header">
                                <div>
                                    <h2>Settings for {selectedCategory.name}</h2>
                                    <p className="settings-panel-description">
                                        Customize your quiz before starting.
                                    </p>
                                </div>
                                <button className="close-settings-button" onClick={() => setSelectedCategory(null)}>
                                    Close
                                </button>
                            </div>

                        <div className="settings-row">
                            <label htmlFor="difficulty">Difficulty Level</label>
                            <select className="form-control" id="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                                <option value="easy">Easy (More hints, longer time)</option>
                                <option value="medium">Medium (Standard)</option>
                                <option value="hard">Hard (No hints, shorter time)</option>
                            </select>
                        </div>

                        <div className="settings-row">
                            <label htmlFor="timer">Time per Question</label>
                            <select className="form-control" id="timer" value={timer} onChange={(event) => setTimer(event.target.value)}>
                                <option value="none" disabled={difficulty === "hard"}>No Timer (Relaxed)</option>
                                <option value="30">30 Seconds</option>
                                <option value="15">15 Seconds (Speed run)</option>
                            </select>
                            {difficulty === "hard" && timer === "none" && (
                                <p className="settings-note hard-note" style={{ marginTop: '10px' }}>
                                    Hard mode requires a timer. Using 15 seconds.
                                </p>
                            )}
                        </div>

                        {difficulty === "easy" && (
                            <div className="settings-note easy-note">
                                Easy mode gives you 2 free 50/50 hints!
                            </div>
                        )}
                        {difficulty === "hard" && (
                            <div className="settings-note hard-note">
                                Hard mode disables skipping and halves the timer.
                            </div>
                        )}

                        <div className="settings-actions">
                            <button className="start-quiz-button" onClick={handleStartQuiz}>
                                Start {selectedCategory.name} Quiz
                            </button>
                        </div>
                    </section>
                    </div>
                )}
            </main>
            <footer className="home-footer">
                <p className="footer-text">© 2024 QuizMaster. All rights reserved.</p>
            </footer>
        </>
    );
}