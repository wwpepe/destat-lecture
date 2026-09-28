import { expect } from "chai";
import { network } from "hardhat";

interface Question {
    question: string;
    options: string[];
}

// ------------------------ SurveyFactory testcase --------------------------- // 
describe("SurveyFactory Contract", () => {

  let factory: any, owner: any, respondent1: any, respondent2: any;

  beforeEach(async () => {
    const { ethers } = await network.connect();

    [owner, respondent1, respondent2] = await ethers.getSigners();

    factory = await ethers.deployContract("SurveyFactory", [
      ethers.parseEther("50"), // min_pool_amount
      ethers.parseEther("0.1"), // min_reward_amount
    ]);
  });

  it("should deploy with correct minimum amounts", async () => {
    // TODO: check min_pool_amount and min_reward_amount
    const { ethers } = await network.connect();
    
    const min_pool_amount = await factory.min_pool_amount();
    const min_reward_amount = await factory.min_reward_amount();
    
    expect(min_pool_amount).to.equal(ethers.parseEther("50"));
    expect(min_reward_amount).to.equal(ethers.parseEther("0.1"));
  });

  it("should create a new survey when valid values are provided", async () => {
    // TODO: prepare SurveySchema and call createSurvey with msg.value
    // TODO: check event SurveyCreated emitted
    // TODO: check surveys array length increased
    const { ethers } = await network.connect();
    
    const title = "설문조사";
    const description = "설문조사 설명";
    const questions: Question[] = [{
      question: "설문조사 질문",
      options: ["옵션 1", "옵션 2", "옵션 3"]
    }];
    
    const surveySchema = {
      title,
      description,
      targetNumber: 100,
      questions
    };
    
    const initialSurveys = await factory.getSurveys();
    const initialLength = initialSurveys.length;
    
    const tx = await factory.connect(owner).createSurvey(surveySchema, {
      value: ethers.parseEther("100")
    });
    
    const receipt = await tx.wait();
    
    let eventEmitted = false;
    let surveyAddress;
    receipt?.logs?.forEach((log: any) => {
      const event = factory.interface.parseLog(log);
      if (event?.name === "SurveyCreated") {
        eventEmitted = true;
        surveyAddress = event.args[0];
      }
    });
    
    expect(eventEmitted).to.be.true;
    expect(surveyAddress).to.not.be.undefined;
    
    const surveys = await factory.getSurveys();
    expect(surveys.length).to.equal(initialLength + 1);
  });

  it("should revert if pool amount is too small", async () => {
    // TODO: expect revert when msg.value < min_pool_amount
    const { ethers } = await network.connect();
    
    const title = "설문조사";
    const description = "설문조사 설명";
    const questions: Question[] = [{
      question: "설문조사 질문",
      options: ["옵션 1", "옵션 2", "옵션 3"]
    }];
    
    const surveySchema = {
      title,
      description,
      targetNumber: 100,
      questions
    };
    
    const insufficientAmount = ethers.parseEther("40");
    
    await expect(
      factory.connect(owner).createSurvey(surveySchema, {
        value: insufficientAmount
      })
    ).to.be.revertedWith("Insufficient pool amount");
  });

  it("should revert if reward amount per respondent is too small", async () => {
    // TODO: expect revert when msg.value / targetNumber < min_reward_amount
    const { ethers } = await network.connect();
    
    const title = "설문조사";
    const description = "설문조사 설명";
    const questions: Question[] = [{
      question: "설문조사 질문",
      options: ["옵션 1", "옵션 2", "옵션 3"]
    }];
    
    const surveySchema = {
      title,
      description,
      targetNumber: 1000,
      questions
    };
    
    await expect(
      factory.connect(owner).createSurvey(surveySchema, {
        value: ethers.parseEther("50")
      })
    ).to.be.revertedWith("Insufficient reward amount");
  });

  it("should store created surveys and return them from getSurveys", async () => {
    // TODO: create multiple surveys and check getSurveys output
    const { ethers } = await network.connect();
    
    const questions: Question[] = [{
      question: "설문조사 질문",
      options: ["옵션 1", "옵션 2", "옵션 3"]
    }];
    
    const surveySchema1 = {
      title: "설문조사 1",
      description: "설문조사 설명 1",
      targetNumber: 100,
      questions
    };
    
    await factory.connect(owner).createSurvey(surveySchema1, {
      value: ethers.parseEther("100")
    });
    
    const surveySchema2 = {
      title: "설문조사 2",
      description: "설문조사 설명 2",
      targetNumber: 200,
      questions
    };
    
    await factory.connect(respondent1).createSurvey(surveySchema2, {
      value: ethers.parseEther("200")
    });
    
    const surveySchema3 = {
      title: "설문조사 3",
      description: "설문조사 설명 3",
      targetNumber: 150,
      questions
    };
    
    await factory.connect(respondent2).createSurvey(surveySchema3, {
      value: ethers.parseEther("150")
    });
    
    const surveys = await factory.getSurveys();
    expect(surveys.length).to.equal(3);
    
    expect(surveys[0]).to.not.be.undefined;
    expect(surveys[1]).to.not.be.undefined;
    expect(surveys[2]).to.not.be.undefined;
  });

});
// ------------------------ SurveyFactory testcase end --------------------------- // 


// 블록체인 실습
it("Survey init", async () => {
    const { ethers } = await network.connect();

    const title = "설문조사";
    const description = "설문조사 설명";
    const questions: Question[] = [{
        question: "설문조사 질문",
        options: ["옵션 1", "옵션 2", "옵션 3"]
    }]

    const factory = await ethers.deployContract("SurveyFactory", [
        ethers.parseEther("50"),
        ethers.parseEther("0.1")
    ]);
    const tx = await factory.createSurvey({title, description, targetNumber: 100, questions}, {value: ethers.parseEther("100")});

    // const surveys = await factory.getSurveys();
    const recipt = await tx.wait();
    let surveyAddress;
    recipt?.logs?.forEach(log => {
        const event = factory.interface.parseLog(log);
        if (event?.name === "SurveyCreated") {
            surveyAddress = event.args[0];
        }
        // console.log(event)

    })
    // console.log(recipt?.logs);
    
    const surveyC = await ethers.getContractFactory("Survey");
    const signers = await ethers.getSigners();
    const respondent = signers[0];
    if (surveyAddress) {
        const survey = await surveyC.attach(surveyAddress);
        // console.log(await survey.getQuestions());
        await survey.connect(respondent);
        console.log(ethers.formatEther(await ethers.provider.getBalance(respondent)));
        const submitTx = await survey.submitAnswer({
            respondent,
            answers: [1],
        });
        await submitTx.wait();
        console.log(ethers.formatEther(await ethers.provider.getBalance(respondent)));

    }
    

    


    // --------------------------------------------------- //
    // const s = await ethers.deployContract("Survey", [title, description, questions])
    // // console.log(await s.title());
    // // console.log(await s.description());
    // // console.log(await s.getQuestions());
    // const _title = await s.title()
    // const _desc = await s.description()
    // const _questions = await s.getQuestions()
    // expect(_title).to.equal(title);
    // expect(_desc).to.equal(description);
    // expect(_questions[0].options).deep.eq(questions[0].options);

    // const signers = await ethers.getSigners();
    // const respondent = signers[1];
    // await s.connect(respondent)
    // await s.submitAnswer({
    //     respondent: respondent.address,
    //     answers: [1]
    // })

    // console.log(await s.getAnswers())
})