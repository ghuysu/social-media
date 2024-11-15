// App.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UserProfile from './routes/UserProfile';
import NotFound from './routes/NotFound';
import SignInGoogle from './routes/SignInGoogle';

const App = () => {
  return (
    <Routes>
      <Route path="/friend/:userId" element={<UserProfile />} />
      <Route path="/login/google" element={<SignInGoogle />} />
      <Route path="*" element={<NotFound />} /> {/* Route 404 */}
    </Routes>
  );
};

export default App;
