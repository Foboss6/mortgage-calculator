import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

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
  const location = useLocation();

  const [inputData, setInputData] = React.useState({
    initialloan: '',
    downpayment: '',
    bankname: '',
  });

  const [outputData, setOutputData] = React.useState({});
  const [banks, setBanks] = React.useState({});
  // const [isCalculated, setIsCalculated] = React.useState(false);

  
  const splitedPathname = location.pathname.split('/');
  const historyBank = splitedPathname[splitedPathname.length - 1].includes('mortgage-calculator') ? '' : splitedPathname[splitedPathname.length - 1];

  const [currentHistory, setCurrentHistory] = React.useState('');
  const [bankHistory, setBankHistory] = React.useState({});

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
        if(data.length) {
          setBanks((prevState) => {
            return {
              ...prevState,
              [el.id]: el,
            }
          });
        } else console.log(data);
      });
    })
    .catch(console.log);
  }

  const calculatePayments = () => {
    let p = parseInt(inputData.initialloan, 10);
    let r = parseInt(inputData.bankData.interestrate, 10)/100;
    let n = 1;
    if(inputData.bankData.loanterm.toLowerCase().includes('m')) n = parseInt(inputData.bankData.loanterm, 10);
    else if(inputData.bankData.loanterm.toLowerCase().includes('y')) n = parseInt(inputData.bankData.loanterm, 10) * 12;
    
    let m = Number(((p*(r/12)*Math.pow((1+r/12), n))/(Math.pow((1+r/12), n) - 1)).toFixed(2));

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
      loanbalance = Number((loanbalance - m + interestpayment).toFixed(2));
      equity = Number((equity + m - interestpayment).toFixed(2));

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

    return calcData;
  }

  const saveBankHistory = () => {
    const { initialloan, downpayment, bankname } = inputData;
    fetch(`${SERVER_PATH}/mortgage-calculator/history`, {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ bankname, initialloan, downpayment })
    })
    .then((res) => res.json())
    .then((data) => {
      if(data.id) console.log('success');
      else console.log(data);
    })
    .catch(console.log);
  }

  const loadBankHistory = (bank) => {
    setBankHistory({});
    fetch(`${SERVER_PATH}/mortgage-calculator/history/${bank}`)
    .then(res => res.json())
    .then(data => {
      if(data.length) {
        let temp = {};
        data.map((el) => temp = {
          ...temp, 
          [el.date.split('.')[0].replace(/T/, ' ')]: {
            ...el, date: el.date.split('.')[0].replace(/T/, ' ')
          }
        });
        setBankHistory(temp);
        // setShowHistory(false);
        // setCurrencyHystory(data.map(({date}) => date.split('.')[0].replace(/T/, ' ')));
      } else {
        console.log(`"${bank}" have no history`);
        // setBankHistory({});
        // setShowHistory(false);
      }
    })
    .catch(console.log);
  }

  // load a banks list from the database when component did mount
  React.useEffect(() => {
    loadBanks();
    
    if(historyBank) {
      handleBankChange({target:{value: historyBank}});
    }
  }, []);
  // when the bank will be chosen check and load bank's history
  React.useEffect(() => {
    if(inputData.bankname) loadBankHistory(inputData.bankname);
  }, [inputData.bankname]);
  // when history will be loaded choose the first record
  React.useEffect(() => {
    if(historyBank && Object.keys(bankHistory).length) {
      handleHistoryChange({target:{value: Object.values(bankHistory)[0].date}})
    }
  }, [bankHistory]);

  const onInputChange = (event, fieldName) => {
    setInputData((prevState) => ({
      ...prevState,
      [fieldName]: event.target.value
    }));

    setOutputData({});
  }

  const handleBankChange = (event) => {
    setInputData((prevState) => (
      {
        ...prevState,
        bankname: event.target.value,
        bankData: {},
      }
    ));
    setOutputData({});
    // get selected bank's data from server
    fetch(`${SERVER_PATH}/mortgage-calculator/${event.target.value}`)
    .then((res) => res.json())
    .then(data => {
      if(data.id) {
        setInputData((prevState) => ({
          ...prevState,
          bankData: data,
        }));
      } else console.log(data);
    })
    .catch(console.log);
  }

  const handleHistoryChange = (event) => {
    setCurrentHistory(event.target.value);

    setInputData((prevState) => (
      {
        ...prevState,
        initialloan: bankHistory[event.target.value].initialloan,
        downpayment: bankHistory[event.target.value].downpayment,
      }
    ));
    if(inputData.bankData.id) setOutputData(calculatePayments());
  }

  const handleButtonClick = (event) => {
    clearAllErrors();
    setOutputData({});

    if( !inputData.bankname ) return setError('bankname');
    if( !inputData.initialloan ) return setError('initialloan');
    if( parseInt(inputData.initialloan) > parseInt(inputData.bankData.maxloan) ) return setError('initialloan');
    if( !inputData.downpayment ) return setError('downpayment');
    if( parseInt(inputData.downpayment) < parseInt(inputData.bankData.mindownpayment) ) return setError('downpayment');

    if(inputData.bankData.id) {
      // calculate all payments
      setOutputData(calculatePayments());

      // save input data to the bank's history
      saveBankHistory();
    }
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
            value={inputData.initialloan}
            error={helperError.initialloan}
            variant="outlined"
            margin="normal"
            onChange={(ev) => onInputChange(ev, 'initialloan')}
          />
          <TextField
            id="outlined-helperText-interestrate"
            label="Down Payment"
            helperText="Please indicate the down payment"
            value={inputData.downpayment}
            error={helperError.downpayment}
            variant="outlined"
            margin="normal"
            onChange={(ev) => onInputChange(ev, 'downpayment')}
          />
          <TextField
            id="outlined-select-currency"
            select
            label="Select The Bank"
            value={inputData.bankname}
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
          {
            Object.keys(bankHistory).length
            ?
              <TextField
                id="outlined-select-currencyHistory"
                select
                label="HISTORY: select The Date"
                value={currentHistory}
                onChange={handleHistoryChange}
                helperText="HISTORY: select the date you whant to see"
                variant="outlined"
                margin="normal"
              >
                {
                  Object.values(bankHistory).map((hist) => (
                    <MenuItem key={hist.date} value={hist.date}>
                      {hist.date}
                    </MenuItem>
                  ))
                }
              </TextField>
            :
              <></>
          }
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
        Object.keys(outputData).length
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
                    <TableCell key={data.month + 1} align="center">{data.month}</TableCell>
                    <TableCell key={data.month + 2} align="center">{data.totalpayment}</TableCell>
                    <TableCell key={data.month + 3} align="center">{data.interestpayment}</TableCell>
                    <TableCell key={data.month + 4} align="center">{data.loanbalance}</TableCell>
                    <TableCell key={data.month + 5} align="center">{data.equity}</TableCell>
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