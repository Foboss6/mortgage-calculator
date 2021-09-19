import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { SERVER_PATH } from '../variables/pathnames';

import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import HistoryIcon from '@material-ui/icons/History';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Paper from '@material-ui/core/Paper';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(),
    overflowX: 'auto',
    backgroundColor: 'transparent',
  },
  table: {
    minWidth: 700,
  },
  head: {
    fontSize: 20,
  },
  body: {
    fontSize: 16,
  },
  floatingButton: {
    position: 'fixed',
    top: 'auto',
    right: '10%',
    bottom: '2%',
    left: 'auto',
  },
});

const BanksList = (props) => {
  const { classes } = props;
  const history = useHistory();

  const [banks, setBanks] = useState({});

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

  const handleDeleteButtonClick = (event) => {

    const banksId = event.currentTarget.value;

    fetch(`${SERVER_PATH}/banks/delete`, {
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id: banksId})
    })
    .then((res) => res.json())
    .then(data => {
      if(data === 'success') {
        // if the bank was successfully delete from the database, delete it from the list
        setBanks((prevState) => {
          const banks = {...prevState}
          delete banks[banksId];
          return banks;
        })
      }
      else console.log(data);
    })
    .catch(console.log);
  }

  return (
    <div className="banks">
    <div>
      <Button 
        variant="contained" 
        onClick={() => history.push('/mortgage-calculator')}
      >
        Mortgage Calculator
      </Button>
    </div>
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.head} align="center">
              <span>Bank Name</span>
            </TableCell>
            <TableCell className={classes.head} align="center">
              <span>Interest Rate</span>
            </TableCell>
            <TableCell className={classes.head} align="center">
              <span>Maximum Loan</span>
            </TableCell>
            <TableCell className={classes.head} align="center">
              <span>Minimum Down Payment</span>
            </TableCell>
            <TableCell className={classes.head} align="center">
              <span>Loan Term</span>
            </TableCell>
            <TableCell align="center"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.values(banks)
          .sort((a, b) => {
            if(a.bankname.toLowerCase() > b.bankname.toLowerCase()) return 1;
            if(a.bankname.toLowerCase() < b.bankname.toLowerCase()) return -1;
            return 0;
          })
          .map((bank) => (
            <TableRow key={bank.id}>
              <TableCell className={classes.body} align="center">{bank.bankname}</TableCell>
              <TableCell className={classes.body} align="center">{bank.interestrate}</TableCell>
              <TableCell className={classes.body} align="center">$ {bank.maxloan}</TableCell>
              <TableCell className={classes.body} align="center">$ {bank.mindownpayment}</TableCell>
              <TableCell className={classes.body} align="center">{bank.loanterm}</TableCell>
              <TableCell align="right">
                <IconButton aria-label="history" value={bank.bankname} onClick={(event) => history.push(`/mortgage-calculator/${event.currentTarget.value}`)}>
                  <HistoryIcon />
                </IconButton>
                <IconButton aria-label="edit" value={bank.id} onClick={(event) => history.push(`/banks/${event.currentTarget.value}`)}>
                  <EditIcon />
                </IconButton>
                <IconButton aria-label="delete" value={bank.id} onClick={handleDeleteButtonClick}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
    <div className={classes.floatingButton}>
      <Fab color="primary" aria-label="add" onClick={() => history.push(`/banks/create`)}>
        <AddIcon />
      </Fab>
    </div>
    </div>
  );
} 

export default withStyles(styles)(BanksList);