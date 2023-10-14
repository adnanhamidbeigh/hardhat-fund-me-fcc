const { assert, expect } = require("chai");
const { ethers, network, deployments, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip() :

    describe("FundMe", function () {
        let fundMe;
        let deployerOf;
        let mockV3Aggregator;
        const sendEth = ethers.parseEther("1");

        beforeEach(async function () {
            deployerOf = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"])
            fundMe = await ethers.getContract("FundMe", deployerOf)
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployerOf)


        })
        describe('constructor', function () {
            it("Sets constructor addresses correctly", async function () {
                const response = await fundMe.priceFeed()
                console.log(await mockV3Aggregator.getAddress())
                // assert.equal(response, await mockV3Aggregator.getAddress()) // Use getAddress() instead of address
                // Allah U Akbar
            })
        })
        describe('fund', function () {
            it("It fails if you dont send enough USD", async function () {
                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
            })
            it("Updates amount funded data structure", async function () {
                await fundMe.fund({ value: sendEth });
                const response = await fundMe.addressToAmountFunded(deployerOf)
                assert.equal(response.toString(), sendEth.toString())
            })
            it("Add funders to array of funders", async function () {
                await fundMe.fund({ value: sendEth });
                const funder = await fundMe.funders(0);
                assert.equal(funder, deployerOf);
            })
        })

        describe("Withdraw", function () {
            beforeEach(async function () {
                await fundMe.fund({ value: sendEth });
            });
            it("Withdraw fund from single funder", async function () {
                // Arrange
                const startingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress()); //change all address to getAddress()
                const startingDeployerBalance = await ethers.provider.getBalance(deployerOf);

                // Act
                const txResponse = await fundMe.withdraw()
                const txReciept = await txResponse.wait(1);
                const { gasUsed, gasPrice } = txReciept

                const gasCost = gasUsed * gasPrice  //multiply

                const endingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress());
                const endingDeployerBalance = await ethers.provider.getBalance(deployerOf);

                // Assert

                assert.equal(endingFundMeBalance.toString(), "0")
                assert.equal((startingFundMeBalance + startingDeployerBalance).toString(), (endingDeployerBalance + gasCost).toString())
                // .add, .mul not working in ethers v6.8


            })
            it("Allows us to withdraw with multiple funders", async function () {
                //Arrange
                const accounts = await ethers.getSigners();
                for (let i = 0; i < 6; i++) {
                    const fundMeConnectedContract = fundMe.connect(accounts[i]);
                    await fundMeConnectedContract.fund({ value: sendEth });
                }
                const startingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress()); //change all address to getAddress()
                const startingDeployerBalance = await ethers.provider.getBalance(deployerOf);

                // Act
                const txResponse = await fundMe.withdraw()
                const txReciept = await txResponse.wait(1);
                const { gasUsed, gasPrice } = txReciept

                const gasCost = gasUsed * gasPrice  //multiply

                const endingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress());
                const endingDeployerBalance = await ethers.provider.getBalance(deployerOf);

                // assert
                assert.equal(endingFundMeBalance.toString(), "0")
                assert.equal((startingFundMeBalance + startingDeployerBalance).toString(), (endingDeployerBalance + gasCost).toString())
                // .add, .mul not working in ethers v6.8

                // Funders are reseted properly
                await expect(fundMe.funders(0)).to.be.reverted;

                for (i = 1; i < 6; i++) {
                    assert.equal(await fundMe.addressToAmountFunded(await accounts[i].getAddress()), 0)
                }

            })

            it("Only Owner can Withdraw", async function () {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]

                const attackerConnectedContract = await fundMe.connect(attacker)
                await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
            })

            it("cheaper withdraw testing", async function () {
                //Arrange
                const accounts = await ethers.getSigners();
                for (let i = 0; i < 6; i++) {
                    const fundMeConnectedContract = fundMe.connect(accounts[i]);
                    await fundMeConnectedContract.fund({ value: sendEth });
                }
                const startingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress()); //change all address to getAddress()
                const startingDeployerBalance = await ethers.provider.getBalance(deployerOf);

                // Act
                const txResponse = await fundMe.cheaperWithdraw()
                const txReciept = await txResponse.wait(1);
                const { gasUsed, gasPrice } = txReciept

                const gasCost = gasUsed * gasPrice  //multiply

                const endingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress());
                const endingDeployerBalance = await ethers.provider.getBalance(deployerOf);

                // assert
                assert.equal(endingFundMeBalance.toString(), "0")
                assert.equal((startingFundMeBalance + startingDeployerBalance).toString(), (endingDeployerBalance + gasCost).toString())
                // .add, .mul not working in ethers v6.8

                // Funders are reseted properly
                await expect(fundMe.funders(0)).to.be.reverted;

                for (i = 1; i < 6; i++) {
                    assert.equal(await fundMe.addressToAmountFunded(await accounts[i].getAddress()), 0)
                }

            })

        })
        describe("Recieve", function () {
            it("FundMe recieve from accounts not signed", async function () {
                const startingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress()); //change all address to getAddress()
                const signer = (await ethers.getSigners())[0];
                const startingSignerBalance = await ethers.provider.getBalance(signer.address);
                // console.log(startingSignerBalance)
                // console.log(`Starting: ${startingFundMeBalance}`)
                // console.log(signer)
                const tx = {
                    to: await fundMe.getAddress(),
                    value: sendEth,
                }
                const txResponse = await signer.sendTransaction(tx);
                const endingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress()); //change all address to getAddress()
                const endingSignerBalance = await ethers.provider.getBalance(signer.address);
                // console.log(endingSignerBalance)

                const txReciept = await txResponse.wait(1);
                const { gasUsed, gasPrice } = txReciept

                const gasCost = gasUsed * gasPrice


                // console.log(`Ending: ${endingFundMeBalance}`)
                assert.equal((startingFundMeBalance + startingSignerBalance).toString(), (endingFundMeBalance + endingSignerBalance + gasCost).toString())

            })

           

        })
        // describe("Fallback", function(){
        //     it("Invokes fallback function", async function(){
        //         const startingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress()); //change all address to getAddress()
        //         const signer = (await ethers.getSigners())[0];
        //         const startingSignerBalance = await ethers.provider.getBalance(signer.address);
        //         // console.log(startingSignerBalance)
        //         // console.log(`Starting: ${startingFundMeBalance}`)
        //         // console.log(signer)
        //         const tx = {
        //             to: await fundMe.getAddress(),
        //             value: sendEth,
        //             contents: "Hello"
        //         }
        //         const txResponse = await signer.sendTransaction(tx);
        //         const endingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress()); //change all address to getAddress()
        //         const endingSignerBalance = await ethers.provider.getBalance(signer.address);
        //         // console.log(endingSignerBalance)

        //         const txReciept = await txResponse.wait(1);
        //         const { gasUsed, gasPrice } = txReciept

        //         const gasCost = gasUsed * gasPrice


        //         // console.log(`Ending: ${endingFundMeBalance}`)
        //         assert.equal((startingFundMeBalance + startingSignerBalance).toString(), (endingFundMeBalance + endingSignerBalance + gasCost).toString())
        //     })
        // })

    })

