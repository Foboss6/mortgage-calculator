import React from 'react';
import { useHistory } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { SERVER_PATH } from '../variables/pathnames';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  paper: {
    width: '80%',
    margin: '1% auto',
    boxShadow: '0 3px 10px rgb(0 0 0 / 0.2)',
    background: 'transparent',
  }
});

const MortgageCalculator = () => {
  const classes = useStyles();

  const history = useHistory();

  const [inputData, setInputData] = React.useState({});
  const [outputData, setOutputData] = React.useState({});
  const [banks, setBanks] = React.useState({});
  const [currency, setCurrency] = React.useState('');
  const [isCalculated, setIsCalculated] = React.useState(false);

  const [helperError, setHelperError] = React.useState({
    bankname: false,
    downpayment: false,
    initialloan: false,
  });

  const setError = (fieldName) => {
    setHelperError((prevState) => (
      {
        ...prevState,
        [fieldName]: true,
      }
    ));
  };

  const clearAllErrors = () => {
    setHelperError({
      bankname: false,
      downpayment: false,
      initialloan: false,
    });
  };

  // function for loading banks from the database
  const loadBanks = () => {
    setBanks({});
    fetch(`${SERVER_PATH}/banks`)
    .then(res => res.json())
    .then(data => {
      data.forEach((el) => {
        setBanks((prevState) => {
          return {
            ...prevState,
            [el.id]: el,
          }
        })
      });
    })
    .catch(console.log);
  }

  // load a banks list from the database when component did mount
  React.useEffect(() => {
    loadBanks();
  }, []);

  const onInputChange = (event, fieldName) => {
    setInputData((prevState) => ({
      ...prevState,
      [fieldName]: event.target.value
    }));
    setIsCalculated(false);
  }

  const handleBankChange = (event) => {
    setCurrency(event.target.value);
    setInputData((prevState) => (
      {
        ...prevState,
        bankname: event.target.value,
      }
    ));
    // get selected bank's data from server
    fetch(`${SERVER_PATH}/mortgage-calculator/${event.target.value}`)
    .then((res) => res.json())
    .then(data => {
      if(data.id) {
        setInputData((prevState) => ({
          ...prevState,
          bankData: data,
        }))
      } else console.log(data);
    })
    .catch(console.log);
  }

  const handleButtonClick = () => {
    clearAllErrors();

    if( !inputData.bankname ) return setError('bankname');
    if( !inputData.initialloan ) return setError('initialloan');
    if( parseInt(inputData.initialloan) > parseInt(inputData.bankData.maxloan) ) return setError('initialloan');
    if( !inputData.downpayment ) return setError('downpayment');
    if( parseInt(inputData.downpayment) < parseInt(inputData.bankData.mindownpayment) ) return setError('downpayment');

    if(inputData.bankData.id) {
      let p = parseInt(inputData.initialloan, 10);
      let r = parseInt(inputData.bankData.interestrate, 10)/100;
      let n = 1;
      if(inputData.bankData.loanterm.includes('m')) n = parseInt(inputData.bankData.loanterm, 10);
      else if(inputData.bankData.loanterm.includes('y')) n = parseInt(inputData.bankData.loanterm, 10) * 12;
      
      let m = Number(((p*(r/12)*Math.pow((1+r/12), n))/(Math.pow((1+r/12), n) - 1)).toFixed(2));
      
      console.log('p=',p);
      console.log('r=',r);
      console.log('n=',n);
      console.log('m=',m);

      let interestpayment = Number((p*r/12).toFixed(2));
      let loanbalance = Number((parseInt(inputData.initialloan, 10) - m + interestpayment).toFixed(2));
      let equity = Number((parseInt(inputData.downpayment, 10) + m - interestpayment).toFixed(2));
      let calcData = {};
      
      
      calcData = {
        1: {
          month: 1,
          totalpayment: m,
          interestpayment: interestpayment,
          loanbalance: loanbalance,
          equity: equity,
        }
      };
      for(let i=2; i<=n; i++) {
        interestpayment = Number((loanbalance*r/12).toFixed(2));
        console.log(i,'ip1=',interestpayment);
        loanbalance = Number((loanbalance - m + interestpayment).toFixed(2));
        console.log(i,'lb1=',loanbalance);
        equity = Number((equity + m - interestpayment).toFixed(2));
        console.log(i,'eq = ', equity);

        calcData = {
          ...calcData,
          [i]: {
            month: i,
            totalpayment: m,
            interestpayment: interestpayment,
            loanbalance: loanbalance,
            equity: equity,
          }
        };
      }

      setOutputData(calcData);

      setIsCalculated(true);
    } else  setIsCalculated(false);
  }

  return (
    <div>
      <div>
        <Button 
          variant="contained" 
          onClick={() => history.push('/')}
        >
          BACK
        </Button>
      </div>
      <div className="center">
        <h2> Welcome to The Mortgage Calculator</h2>
        <div>
          <TextField
            id="outlined-helperText-bankname"
            label="Initial Loan"
            helperText="Please indicate your initial loan"
            error={helperError.initialloan}
            variant="outlined"
            margin="normal"
            onChange={(ev) => onInputChange(ev, 'initialloan')}
          />
          <TextField
            id="outlined-helperText-interestrate"
            label="Down Payment"
            helperText="Please indicate the down payment"
            error={helperError.downpayment}
            variant="outlined"
            margin="normal"
            onChange={(ev) => onInputChange(ev, 'downpayment')}
          />
          <TextField
            id="outlined-select-currency"
            select
            label="Select The Bank"
            value={currency}
            onChange={handleBankChange}
            helperText="Please select the bank you need"
            error={helperError.bankname}
            variant="outlined"
            margin="normal"
          >
          {
            banks
            ?
              Object.values(banks).map((bank) => (
                <MenuItem key={bank.bankname} value={bank.bankname}>
                  {bank.bankname}
                </MenuItem>
              ))
            :
              <></>
          }
          </TextField>
          <div>
            <Button 
              variant="contained" 
              onClick={handleButtonClick}
            >
              Calculate
            </Button>
          </div>
        </div>
      </div>
      {
        isCalculated
        ?
        <div>
          <TableContainer className={classes.paper} component={Paper}>
            <Table className={classes.table} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Month</TableCell>
                  <TableCell align="center">Total payment&nbsp;($)</TableCell>
                  <TableCell align="center">Interest payment&nbsp;($)</TableCell>
                  <TableCell align="center">Loan balance&nbsp;($)</TableCell>
                  <TableCell align="center">Equity&nbsp;($)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.values(outputData).map((data) => (
                  <TableRow key={data.bankname}>
                    <TableCell align="center" component="th" scope="data">
                      {data.month}
                    </TableCell>
                    <TableCell align="center">{data.totalpayment}</TableCell>
                    <TableCell align="center">{data.interestpayment}</TableCell>
                    <TableCell align="center">{data.loanbalance}</TableCell>
                    <TableCell align="center">{data.equity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        :
        <></>
      }
    </div>
  )
} 

export default MortgageCalculator;