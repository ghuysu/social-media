// App.js
import { Route, Routes } from 'react-router-dom';
import UserProfile from './routes/UserProfile';
import NotFound from './routes/NotFound';

const App = () => {
  return (
    <Routes>
      <Route path="/friend/:userId" element={<UserProfile />} />
      <Route path="*" element={<NotFound />} /> {/* Route 404 */}
    </Routes>
  );
};

export default App;
