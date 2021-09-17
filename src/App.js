import { Switch, Route, Redirect } from 'react-router-dom';

import BanksList from './components/BanksList';
import Edit from './components/Edit';
import Create from './components/Create';
import MortgageCalculator from './components/MortgageCalculator';

function App() {
  return (
    <Switch>
      <Route exact path='/'>
        <Redirect to="/banks" />
      </Route>
      <Route exact path='/banks'>
        <BanksList />
      </Route>
      <Route exact path='/mortgage-calculator'>
        <MortgageCalculator />
      </Route>
      <Route exact path='/banks/create'>
        <Create />
      </Route>
      <Route exact path='/banks/:id'>
        <Edit />
      </Route>
    </Switch>
  );
}

export default App;
