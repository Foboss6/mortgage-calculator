import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { SERVER_PATH } from '../variables/pathnames';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const Edit = () => {
  
  const history = useHistory();
  const location = useLocation();

  //take bank ID from pathname
  const splittedPathname = location.pathname.split('/');
  const bankToEditId = splittedPathname[splittedPathname.length - 1];

  const [bank, setBank] = React.useState({});

  // first of all load bank's data from a database
  React.useEffect(() => {
    fetch(`${SERVER_PATH}/banks/${bankToEditId}`)
    .then(res => res.json())
    .then(data => setBank(data))
    .catch(console.log);
  }, [bankToEditId]);
  
  const onInputChange = (event, fieldName) => {
    setBank((prevState) => ({
      ...prevState,
      [fieldName]: event.target.value
    }));
  }

  const handleButtonClick = () => {
    fetch(`${SERVER_PATH}/banks/${bankToEditId}`, {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(bank),
    })
    .then((res) => res.json())
    .then(data => data.includes('success') ? history.push('/') : console.log(`An error occurred during access to the database`))
    .catch(console.log);

    // for now, return to '/' in any case
    history.push('/');
  }
  
  return(
      !!bank.id
      ?
        <div>
          <h3>Edit {bank.bankname}'s data</h3>
          <div>
            <TextField
              id="outlined-helperText-bankname"
              label="Bank Name"
              defaultValue={bank.bankname}
              variant="outlined"
              margin="normal"
              onChange={(ev) => onInputChange(ev, 'bankname')}
            />
          </div>
          <div>
            <TextField
              id="outlined-helperText-interestrate"
              label="Interest Rate"
              defaultValue={bank.interestrate}
              variant="outlined"
              margin="normal"
              onChange={(ev) => onInputChange(ev, 'interestrate')}
            />
          </div>
          <div>
            <TextField
              id="outlined-helperText-maxloan"
              label="Maximum Loan"
              defaultValue={bank.maxloan}
              variant="outlined"
              margin="normal"
              onChange={(ev) => onInputChange(ev, 'maxloan')}
            />
          </div>
          <div>
            <TextField
              id="outlined-helperText-mindownpayment"
              label="Minimum Down Payment"
              defaultValue={bank.mindownpayment}
              variant="outlined"
              margin="normal"
              onChange={(ev) => onInputChange(ev, 'mindownpayment')}
            />
          </div>
          <div>
            <TextField
              id="outlined-helperText-loanterm"
              label="Loan Term"
              defaultValue={bank.loanterm}
              variant="outlined"
              margin="normal"
              onChange={(ev) => onInputChange(ev, 'loanterm')}
            />
          </div>
          <div>
            <Button 
              variant="contained" 
              onClick={handleButtonClick}
            >
              Save
            </Button>
          </div>
        </div>
      :
      <div>
        <h3>An error in loading bank's data</h3>
      </div>
  )
}

export default Edit;