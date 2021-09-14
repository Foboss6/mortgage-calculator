import { Switch, Route } from 'react-router-dom';
import './App.css';
import BanksList from './components/BanksList';
import MortgageCalculator from './components/MortgageCalculator';

function App() {
  return (
    <Switch>
      <Route pathname='/'>
        <BanksList />
      </Route>
      <Route exact pathname='/mortgage-calculator'>
        <MortgageCalculator />
      </Route>
    </Switch>
  );
}

export default App;
