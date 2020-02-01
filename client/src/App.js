import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import OtherPage from './OtherPage';
import Fib from './Fib';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h3>Fib Calculator</h3>
          <div>
            <Link to="/">Home</Link> &nbsp;
            <Link to="/otherpage">Other Page</Link>
          </div>

          <div>
            <Route exact path="/" component={Fib} />
            <Route path="/otherpage" component={OtherPage} />
        </div>
        </header>
      </div>
    </Router>
  );
}

export default App;
