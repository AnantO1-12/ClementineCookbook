import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AddRecipePage } from './pages/AddRecipePage';
import { EditRecipePage } from './pages/EditRecipePage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="recipes/:slug" element={<RecipeDetailPage />} />
          <Route
            path="recipes/new"
            element={
              <ProtectedRoute>
                <AddRecipePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="recipes/:slug/edit"
            element={
              <ProtectedRoute>
                <EditRecipePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
