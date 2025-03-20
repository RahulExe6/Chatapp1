import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import HomePage from './HomePage'; // Assuming this component exists
import AuthPage from './AuthPage';   // Assuming this component exists
import ProfileSetup from './ProfileSetup'; // Assuming this component exists


function App() {
  return (
    <Router>
      <div>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/setup" component={ProfileSetup} />
      </div>
    </Router>
  );
}

export default App;