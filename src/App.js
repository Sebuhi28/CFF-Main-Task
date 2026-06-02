import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import ResultPage from './components/ResultPage';
import { HashRouter, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </HashRouter>
    
  );
}

export default App;
