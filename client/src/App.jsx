import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header'; // или правильный путь, если у тебя он в другом месте
import AlertBanner from './components/AlertBanner';
import AdminPanel from './pages/Admin';
import Article from './pages/Article';
import Footer from "./components/Footer";
import ArticlesPage from "./pages/ArticlesPage";
import CoursesPage from "./pages/CoursesPage";
import CoursePage from "./pages/Course";
import LearnEarn from "./pages/LearnEarn";
import SettingsPage from "./components/SettingsPage";
import MyCourses from "./components/MyCourses";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <AlertBanner />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/article/:id" element={<Article />} />
          <Route path="/articles" element={<ArticlesPage/>} />
          <Route path="/courses" element={<CoursesPage/>} />
          <Route path="/courses/:id" element={<CoursePage />} />
          <Route path="/learn" element={<LearnEarn />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/my-courses" element={<MyCourses />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
