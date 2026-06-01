import "../components_css/HomePage.css";
import logo from "../assets/logo.png";
import anime from "../assets/anime.png";
import brain from "../assets/brain.png";
import car from "../assets/car.png";
import football from "../assets/football.png";
import gaming from "../assets/gaming.png";
import genknow from "../assets/genknow.png";
import geography from "../assets/geography.png";
import history from "../assets/history.png";
import javascript from "../assets/javascript.png";
import movies from "../assets/movies.png";
import science from "../assets/science.png";
import { Link } from "react-router-dom";



export default function HomePage() {
    const categories = [
        { name: "Anime", image: anime, description: "Test your anime knowledge and trivia", questions: 10 },
        { name: "General Knowledge", image: genknow, description: "A mix of trivia across subjects", questions: 10 },
        { name: "Geography", image: geography, description: "Maps, capitals and places", questions: 10 },
        { name: "History", image: history, description: "Historical events and figures", questions: 10 },
        { name: "JavaScript", image: javascript, description: "Language quirks and APIs", questions: 10 },
        { name: "Movies", image: movies, description: "Film trivia and actors", questions: 10 },
        { name: "Science", image: science, description: "Test your knowledge of scientific facts and discoveries", questions: 10 }
    ];


    return (
        <>
            <header className="home-header">
                <div className="logo-div">
                    <img src={logo} alt="Logo" className="logo" />
                    <h1 className="app-name">QuizMaster</h1>
                </div>
                <div className="home-buttons-div">
                    <Link to="/login" className="login-button">Login</Link>
                    <Link to="/signup" className="signup-button">Sign Up</Link>
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
                                    <button className="category-action-button">Configure Quiz</button>
                                </div>
                            ))
                        }
                    </div>
                </section>
            </main>
            <footer className="home-footer">
                <p className="footer-text">© 2024 QuizMaster. All rights reserved.</p>
            </footer>
        </>
    );
}