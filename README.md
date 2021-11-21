# Rugenerous Interface

An open source interface for Rugenerous -- a community-driven decentralized exchange for Avalanche and Ethereum assets with fast settlement, low transaction fees, and a democratic distribution -- powered by Avalanche.

- Website: [ruggy.exchange](https://ruggy.exchange/)
- DAO Interface: [app.rug.farm](https://app.rug.farm)
- Telegram: [Rugenerous](https://t.me/rugenerous)
- Discord: [Rugenerous](https://discord.com/invite/PARrDYYbfw)
- Twitter: [@rugenerous](https://twitter.com/rugenerous)



## Accessing the Rugenerous Interface

Visit [app.ruggy.exchange](https://app.ruggy.exchange).

## Development

### Install Dependencies

```bash
yarn
```

### Run

```bash
yarn start
```

### Configuring the environment (optional)

To have the interface default to a different network when a wallet is not connected:

1. Make a copy of `.env` named `.env.local`
2. Change `REACT_APP_NETWORK_ID` to `"{YOUR_NETWORK_ID}"`
3. Change `REACT_APP_NETWORK_URL` to your JSON-RPC provider 

Note that the interface only works on testnets where both 
[Rugenerous](https://github.com/rugenerous/exchange-contracts) and 
[multicall](https://github.com/makerdao/multicall) are deployed.
The interface will not work on other networks.

## Attribution
This code was adapted from this Uniswap repo: [uniswap-interface](https://github.com/Uniswap/uniswap-interface).

by @camdengrieh
