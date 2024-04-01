/* eslint-disable */

import * as React from 'react';
import { ethers } from 'ethers';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import QrCodeIcon from '@mui/icons-material/QrCode';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import { Mail } from '@mui/icons-material';
import QRCode from 'react-qr-code';
import LoadingOverlay from 'react-loading-overlay-ts';
import makeSmartAccount from '../utils/makeSmartAccount';
import sendTokens from '../utils/sendTokens';
import ERC20_ABI from '../utils/token_abi';

import QrScanner from '../components/QrScanner';

import se_logo from '../../../../assets/icon.png';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const defaultTheme = createTheme();

export default function Home(props: any) {
  const [open, setOpen] = React.useState(false);
  const [loader, setLoader] = React.useState(false);
  const [smartAccount, setSmartAccount] = React.useState<any>();
  const [addr, setAddr] = React.useState('');
  const [bal, setBal] = React.useState(0);

  const [toAddr, setToAddr] = React.useState('');
  const [toAmt, setToAmt] = React.useState('');

  const contractAddr = ethers.getAddress(process.env.SE_COIN ?? '');
  const provider = new ethers.WebSocketProvider(
    process.env.WS_URL ?? '',
    undefined,
    { polling: true, pollingInterval: 5000 },
  );
  const contract = new ethers.Contract(contractAddr ?? '', ERC20_ABI, provider);

  const getSa = async () => {
    const sa = await makeSmartAccount(props.wallet.privateKey);
    const saAddr = await sa.getAccountAddress();
    setSmartAccount(sa);
    setAddr(saAddr);
  };

  const getBalance = async () => {
    const balanceOf = await contract.balanceOf(addr);
    console.log(balanceOf);
    setBal(Number(ethers.formatUnits(balanceOf)));
  };

  React.useEffect(() => {
    if (!smartAccount && props.wallet) {
      getSa();
    }
  }, [props.wallet]);

  React.useEffect(() => {
    if (addr !== '') {
      getBalance();
      contract.on('Transfer', (from, to, value, event) => {
        let transferEvent = {
          from: from,
          to: to,
          value: value,
          eventData: event,
        };
        console.log(transferEvent, transferEvent.eventData.log.transactionHash);
        getBalance();
      });
    }
  }, [smartAccount]);

  return (
    <LoadingOverlay active={loader} spinner text="Please Wait...">
      <ThemeProvider theme={defaultTheme}>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar position="absolute" open={open}>
            <Toolbar
              sx={{
                pr: '24px',
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Scan QR"
                onClick={() => setOpen(true)}
                sx={{
                  marginRight: '36px',
                }}
              >
                <QrCodeIcon />
              </IconButton>
              <img width="50" alt="icon" src={se_logo} />
              &nbsp;&nbsp;&nbsp;
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                sx={{ flexGrow: 1 }}
              >
                ERC-20 Wallet
              </Typography>
            </Toolbar>
          </AppBar>
          <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: '100vh',
              overflow: 'auto',
            }}
          >
            <Toolbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8} lg={9}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: 240,
                    }}
                  >
                    <QRCode value={addr} />
                    <br />
                    Address: {addr}
                    <br />
                    Balance: {bal} 7E
                    <br />
                    <Link
                      href={`https://opbnb.bscscan.com/address/${addr}`}
                      target="_blank"
                    >
                      View Transaction History
                    </Link>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4} lg={3}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: 240,
                    }}
                  >
                    <br />
                    <Paper
                      component="form"
                      sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        height: '50px',
                        width: '100%',
                      }}
                    >
                      <InputBase
                        value={toAddr}
                        onChange={(evt) => setToAddr(evt.target.value)}
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Destination Address"
                        inputProps={{ 'aria-label': 'to amount' }}
                      />
                      <Divider
                        sx={{ height: 28, m: 0.5 }}
                        orientation="vertical"
                      />
                      &nbsp;
                      <Mail sx={{ fontSize: 32 }} />
                      &nbsp;
                    </Paper>
                    <br />
                    <Paper
                      component="form"
                      sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        height: '50px',
                        width: '100%',
                      }}
                    >
                      <InputBase
                        value={toAmt}
                        type="number"
                        onChange={(evt) => setToAmt(evt.target.value)}
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Amount to send"
                        inputProps={{ 'aria-label': 'to amount' }}
                      />
                      <Divider
                        sx={{ height: 28, m: 0.5 }}
                        orientation="vertical"
                      />
                      <h3>&nbsp;&nbsp;7E&nbsp;&nbsp;</h3>
                    </Paper>
                    <br />
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={async () => {
                        if (Number(toAmt) <= Number(bal)) {
                          setLoader(true);
                          const res = await sendTokens(
                            smartAccount,
                            toAddr,
                            String(toAmt),
                          );
                          setLoader(false);
                          if (res.startsWith('0x')) {
                            setBal(bal - Number(toAmt));
                            setToAddr('');
                            setToAmt('');
                          }
                        } else {
                          alert('Insufficient Funds');
                        }
                      }}
                    >
                      Send
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>
        <QrScanner
          isOpen={open}
          onClose={() => setOpen(false)}
          onScan={(text: string, result: any) => {
            const stringData = text;

            if (stringData.includes('?amount=')) {
              const snAmt = stringData.split('?amount=');
              const snAddr = snAmt[0].split(':');
              setToAmt(snAmt[1]);
              setToAddr(snAddr[1]);
            } else if (
              stringData.includes('opbnb:') ||
              stringData.includes('7e:')
            ) {
              const addr = stringData.split(':');
              setToAddr(addr[1]);
            } else {
              if (stringData.startsWith('0x')) {
                setToAddr(stringData);
              }
            }

            console.log('scanning result', result);

            setOpen(false);
          }}
          onError={(err: any) => {
            setOpen(false);

            alert(err);
          }}
        />
      </ThemeProvider>
    </LoadingOverlay>
  );
}
