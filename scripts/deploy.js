const main = async () => {
    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await deployer.getBalance();

    console.log("Deploying contracts with account: ", deployer.address);
    console.log("Account balance: ", accountBalance.toString());

    const messageContractFactory = await hre.ethers.getContractFactory("Messenger");
    const messageContract = await messageContractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.001"),
    });
    await messageContract.deployed();

    console.log("Messenger address: ", messageContract.address);
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();