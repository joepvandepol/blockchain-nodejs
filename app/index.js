const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');
const Explorer = require('../explorer/wallets');
const Main = require('../cli/index');

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const main = new Main();
const bc = new Blockchain();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);
// const miner = new Miner(bc, tp, wallet, p2pServer);
const explorer = new Explorer();



app.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

app.post('/mine', (req, res) => {
  const block = bc.addBlock(req.body.data);
  console.log(`New block added: ${block.toString()}`);

  p2pServer.syncChains();

  res.redirect('/blocks');
});

app.get('/transactions', (req, res) => {
  res.json(tp.transactions);
});

app.post('/transact', (req, res) => {
  const { recipient, amount } = req.query;
  const transaction = wallet.createTransaction(recipient, amount, bc, tp);
  p2pServer.broadcastTransaction(transaction);
  res.redirect('/transactions');
});

app.get('/mine-transactions', (req, res) => {
  const block = miner.mine();
  console.log(`New block added: ${block.toString()}`);
  res.redirect('/blocks');
});

// app.get('/public-key', (req, res) => { // this wil only generate 1 an ythe same wallet when the bc is initialized
//   res.json({ publicKey: wallet.publicKey });
// });

app.get('/generate-wallet', (req, res) => {
  const wallet = new Wallet();
  res.json({
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
    // keyPair: wallet.keyPair
  });
});

app.get('/explorer', async (req, res) => {
  const explorerData = await explorer.explore(bc);
  console.log('explorerData', explorerData);
  res.json({ explorer: explorerData });
});

app.listen(HTTP_PORT, () => {
  // console.log(`Listening on port ${HTTP_PORT}`)
});
p2pServer.listen();

// npm run dev
// set HTTP_PORT=3002 && set P2P_PORT=5002 && set PEERS=ws://localhost:5001 && npm run dev


