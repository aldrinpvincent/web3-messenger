const main = async () => {
    const messageContractFactory = await hre.ethers.getContractFactory("Messenger");
    const messageContract = await messageContractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.1"),
    });
    await messageContract.deployed();
    console.log("Contract address:", messageContract.address);


    /*
  * Get Contract balance
  */
    let contractBalance = await hre.ethers.provider.getBalance(
        messageContract.address
    );
    console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
    );


    let messageCount;
    messageCount = await messageContract.getTotalNumberOfMessages();
    console.log(messageCount.toNumber());

    let sendMsg1 = await messageContract.sendMessage("A message!");
    await sendMsg1.wait(); // Wait for the transaction to be mined

    let sendMsg2 = await messageContract.sendMessage("A message!");
    await sendMsg2.wait(); // Wait for the transaction to be mined


    /*
  * Get Contract balance to see what happened!
  */
    contractBalance = await hre.ethers.provider.getBalance(messageContract.address);
    console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
    );


    // const [_, randomPerson] = await hre.ethers.getSigners();
    // sendMsg = await messageContract.connect(randomPerson).sendMessage("Another message!");
    // await sendMsg.wait(); // Wait for the transaction to be mined

    let allMessages = await messageContract.getAllMessages();
    console.log(allMessages);
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