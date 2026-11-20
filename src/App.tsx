import { Footer } from '@/components/layout/Footer.tsx';
import { Header } from '@/components/layout/Header.tsx';
import { useEffect } from 'react';
import { NavigationType, Route, Routes, useLocation, useNavigationType } from 'react-router';
import BlogIndex from './pages/BlogIndex.tsx';
import BlogPost from './pages/BlogPost.tsx';
import Home from './pages/Home.tsx';
import NotFound from './pages/NotFound.tsx';

/** Scroll to top on forward navigation; leave back/forward to the browser's restoration. */
function ScrollManager() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    if (navigationType !== NavigationType.Pop) {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}
