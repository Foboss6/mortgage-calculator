import React from 'react';
import { useHistory } from 'react-router-dom';

import { SERVER_PATH } from '../variables/pathnames';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const Edit = () => {
  
  const history = useHistory();

  const [bank, setBank] = React.useState({});
  const [errorText, setErrorText] = React.useState();

  const onInputChange = (event, fieldName) => {
    setBank((prevState) => ({
      ...prevState,
      [fieldName]: event.target.value
    }));
  }

  const inputDataValidation = () => {
    return (
      bank.bankname && bank.interestrate && bank.maxloan && bank.mindownpayment && bank.loanterm
      ? true
      : false
    )
  }

  const handleButtonClick = () => {
    if( inputDataValidation() ) {
      fetch(`${SERVER_PATH}/banks/create`, {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(bank),
      })
      .then((res) => res.json())
      .then(data => data.id ? history.push('/') : setErrorText(data))
      .catch(console.log);
  
      // for now, return to '/' in any case
      // history.push('/');
    } else {
      setErrorText('Invalid data');
    }
  }
  
  return(
    <div>
      <div>
        <h2>You can add a new bank to the database</h2>
      </div>
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
      {
        !!errorText
        ?
          <div>
            <p>{errorText}</p>
          </div>
        :
          <></>
      }
      <div>
        <Button 
          variant="contained" 
          onClick={handleButtonClick}
        >
          Add New Bank
        </Button>
      </div>
    </div>
  )
}

export default Edit;