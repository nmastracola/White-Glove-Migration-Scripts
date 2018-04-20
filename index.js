////////////////  LIBRARIES AND NPMS ////////////////////////

const inquirer = require("inquirer");
const https = require("https");
const request = require("request");
const $ = require("jquery")
const LineByLineReader = require("line-by-line");
const fs = require("fs");
const sleep = require('sleep');
const style = require("ansi-styles");
const colorize = require('colorize')

////////////////////// TOKEN INFO ////////////////////////////
const token = require("./handlers/config.js");
//////////////////// FIND AND REPLACE MODULES/////////////////
const pagesApiGet = require("./handlers/phrase-checker/pagesV2.js")
const discussionsApiGet = require("./handlers/phrase-checker/discussionsV2.js")
const assignmentsApiGet = require("./handlers/phrase-checker/assignmentsV2.js")
const apiGetQuizzes = require("./handlers/phrase-checker/quizzes.js")
///////////// HEADERS AND FOOTERS MODULES//////////////////
const apiGet = require("./handlers/header-footer/pages.js")
////////////////////ROLL BACK MODULES/////////////////////
const rollBackApiGet = require("./handlers/page-roll-back/pagesV2.js")
///////////////////////WILEY SCRIPT////////////////////////
const wileyAssessments = require("./handlers/name-addendum/assignments.js")
///////////////////////////////////////////////////////////
const questionUpdate = require("./handlers/quiz-point-update/quizzes.js")



inquirer
    .prompt([
        
        {
            type: "list",
            message: "Which Script Would You Like To Run??",
            choices: ["Canvas Find And Replace", "Headers and Footers", "Pages Roll Back", "Wiley Assessments", "Quiz Point Update"],
            name: "scriptChoice"
        },

        {
            type: "input",
            message: "What is the School Domain?",
            name: "domain"
        },

        {
            type: "input",
            message: "What is the course number?",
            name: "userCourseNumber"
        },
        {
            type: "input",
            message: "What is the Quiz Number?",
            name: "quizNumber",
            when: function(answers){
                return answers.scriptChoice === 'Quiz Point Update';
              }
        },
        {
            type: "input",
            message: "What Point Value Do You Wish To Set?",
            name: "pointValue",
            when: function(answers){
                return answers.scriptChoice === 'Wiley Assessments' || answers.scriptChoice === 'Quiz Point Update';
              }
        },


        {
            type: "list",
            message: "Do You Want Revert 1 Change or To the Beginning?",
            choices: ["Revert 1", "Start Me From The Beginning"],
            name: "revertOption",
            when: function(answers){
                return answers.scriptChoice === 'Pages Roll Back';
              }
        },

        {
            type: "list",
            message: "What Items would you like to Check?",
            choices: ["Pages", "Discussions", "Assignments", "All"],
            name: "checkObject",
            when: function(answers){
                return answers.scriptChoice === 'Canvas Find And Replace';
              }
        },

        {
            type: "input",
            message: "What string are we searching for?",
            name: "userString",
            when: function(answers){
                return answers.scriptChoice === 'Canvas Find And Replace';
              }
        },

        {
            name: 'searchCaseSensitive',
            type: "list",
            message: 'Do you want your Search to be "Case Sensitive"?',
            choices: ["Yes", "No"],
            when: function(answers){
                return answers.scriptChoice === 'Canvas Find And Replace';
              }
        },

        {
            type: "list",
            message: "Do You Want To Replace It With Something Else?",
            choices: ["Yes", "No"],
            name: "update",
            when: function(answers){
                return answers.scriptChoice === 'Canvas Find And Replace';
              }
        },
        
        {
            name: 'replaceString',
            message: 'What string are we replacing it with?',
            type: 'input',
            when: function(answers){
              return answers.update === 'Yes';
            }
        },

        {
            name: 'replaceCaseSensitive',
            type: "list",
            message: 'Do you want your Replace to be "Case Sensitive"?',
            choices: ["Yes", "No"],
            when: function(answers){
              return answers.update === 'Yes';
            }
        },

        {
            type: "input",
            message: "What is the header file number?",
            name: "headerFileNumber",
            when: function(answers){
                return answers.scriptChoice === 'Headers and Footers';
              }
        },

        {
            type: "input",
            message: "What is the footer file number?",
            name: "footerFileNumber",
            when: function(answers){
                return answers.scriptChoice === 'Headers and Footers';
              }
        },
        {
            type: "confirm",
            message: colorize.ansify("#red[Are you 100% Sure this is correct?  This cannot be undone.  Please double check your file numbers are correct before pressing 'Y']"),
            name: "confirm",
            when: function(answers){
                return answers.scriptChoice === 'Headers and Footers';
              }
        },

    ])
    .then(function(user) {

        var domain = user.domain;
        var checkObject = user.checkObject;
        var string = user.userString
        var userCourseNumber = user.userCourseNumber
        var replaceString = user.replaceString
        var update = user.update
        var replaceCaseSensitive = user.replaceCaseSensitive
        var searchCaseSensitive = user.searchCaseSensitive
        var revertOption = user.revertOption
        var headerFileNumber = user.headerFileNumber
        var footerFileNumber = user.footerFileNumber
        var confirm = user.confirm
        var pointValue = user.pointValue
        var quizNumber = user.quizNumber

        if (update === "Yes"){update = true}else{update = false}
        if (searchCaseSensitive === "Yes"){searchCaseSensitive = true}else{searchCaseSensitive = false}
        if (replaceCaseSensitive === "Yes"){replaceCaseSensitive = true}else{replaceCaseSensitive = false}



        if (token.token === '') {
            console.log("\n\n")
            console.log("You Must Enter A Valid API Token In The CONFIG.JS file")
            console.log("\n\n")
        } else {
                console.log("\n\n")
                console.log(colorize.ansify("#blue[Gathering Information.  Please wait...]"))
                if(user.scriptChoice === 'Canvas Find And Replace'){
                    var pagesApiGetInfo = new pagesApiGet(domain, checkObject, string, userCourseNumber, replaceString, update, replaceCaseSensitive, searchCaseSensitive)
                    var discussionsApiGetInfo = new discussionsApiGet(domain, checkObject, string, userCourseNumber, replaceString, update, replaceCaseSensitive, searchCaseSensitive)
                    var assignmentsApiGetInfo = new assignmentsApiGet(domain, checkObject, string, userCourseNumber, replaceString, update, replaceCaseSensitive, searchCaseSensitive)
                    var apiGetInfoQuizzes = new apiGetQuizzes(domain, checkObject, string, userCourseNumber, replaceString, update)
                   
                    if (checkObject === "Pages") {
                        pagesApiGetInfo.apiCall()
                    } else if( checkObject === "Discussions") {
                        discussionsApiGetInfo.apiCall()
                    } else if(checkObject === "Assignments"){
                        assignmentsApiGetInfo.apiCall()
                    } else if (checkObject === "All"){
                            discussionsApiGetInfo.apiCall()
                            assignmentsApiGetInfo.apiCall()
                            pagesApiGetInfo.apiCall()
                    }
                } else if(user.scriptChoice === 'Headers and Footers'){
                    var apiGetInfo = new apiGet(domain, userCourseNumber, headerFileNumber, footerFileNumber)
                    if(confirm){
                            apiGetInfo.apiCall()
                        }else{
                            console.log(colorize.ansify("\n\n#red[Thank you for double checking.  You just dodged a bullet.]\n\n"))
                        }
                    }else if(user.scriptChoice === 'Pages Roll Back'){
                        var rollBack = new rollBackApiGet(domain, userCourseNumber, revertOption)
                        rollBack.apiCall()
                    }else if (user.scriptChoice === "Wiley Assessments"){
                        var assessmentFix = new wileyAssessments(domain, userCourseNumber, pointValue)
                        assessmentFix.apiCall()
                    } else if (user.scriptChoice === "Quiz Point Update"){
                        var pointFix = new questionUpdate(domain, userCourseNumber, quizNumber, pointValue)
                            pointFix.apiCall()
                    }else{
                        console.log("You Dun Broked something...")
                    }
        }

    })