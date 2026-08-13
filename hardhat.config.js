require("@nomicfoundation/hardhat-toolbox");

// Ganache's default deterministic mnemonic when you run:
//   npx ganache --deterministic
// The first 5 accounts derived from this mnemonic are used below so the
// same addresses/keys show up every time you restart the chain — handy
// for a demo where you don't want addresses changing on every reset.
const GANACHE_MNEMONIC = "myth like bonus scare over problem client lizard pioneer submit female collect";

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    // Local Hardhat network (used for `npx hardhat test`)
    hardhat: {},
    // The actual Ganache instance we deploy to and demo against.
    // Start Ganache first with:  npm run chain
    ganache: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: {
        mnemonic: GANACHE_MNEMONIC,
        count: 5,
      },
    },
  },
};
