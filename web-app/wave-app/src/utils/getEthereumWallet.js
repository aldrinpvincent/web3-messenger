export function getEthereumWallet() {
    try {
        const { ethereum } = window;

        if (!ethereum) {
            console.log("Make sure you have metamask!");
            return [false, "Ethereum object not found, metamask might not have installed"];
        }

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
            const account = accounts[0];
            setCurrentAccount(account);
            return [true, account];
        } else {
            return [false, "No authorized account found"];
        }
    } catch (error) {
        console.log(error);
    }
}