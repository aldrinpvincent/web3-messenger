// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Messenger {
    uint256 totalNumberOfMessages;
    uint256 private seed;

    event NewMessage(address indexed from, uint256 timestamp, string message);

    struct Message {
        address from;
        string message;
        uint256 timestamp;
    }

    Message[] messages;

    /*
     * This is an address => uint mapping, meaning I can associate an address with a number!
     * In this case, I'll be storing the address with the last time the user messaged at us.
     */
    mapping(address => uint256) public lastMessageddAt;

    constructor() payable {
        console.log("Payable constructor");
        seed = (block.timestamp + block.difficulty) % 100;
    }

    function sendMessage(string memory _message) public {
        /*
         * We need to make sure the current timestamp is at least 15-minutes bigger than the last timestamp we stored
         */
        require(
            lastMessageddAt[msg.sender] + 30 seconds < block.timestamp,
            "Wait 30 seconds before sending another message"
        );

        /*
         * Update the current timestamp we have for the user
         */
        lastMessageddAt[msg.sender] = block.timestamp;

        totalNumberOfMessages += 1;
        console.log("sender - %s, message -  %s", msg.sender, _message);

        messages.push(Message(msg.sender, _message, block.timestamp));

        seed = (block.difficulty + block.timestamp + seed) % 100;

        console.log("Random # generated: %d", seed);

        if (seed <= 50) {
            console.log("%s won!", msg.sender);

            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }

        emit NewMessage(msg.sender, block.timestamp, _message);
    }

    function getAllMessages() public view returns (Message[] memory) {
        return messages;
    }

    function getTotalNumberOfMessages() public view returns (uint256) {
        console.log("We have %d total messages!", totalNumberOfMessages);
        return totalNumberOfMessages;
    }
}
