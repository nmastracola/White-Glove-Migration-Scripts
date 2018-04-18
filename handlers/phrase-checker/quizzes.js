var token = require("../config.js");
const inquirer = require("inquirer");
const https = require("https");
const request = require("request");
const $ = require("jquery");
const LineByLineReader = require("line-by-line");
const fs = require("fs");
const sleep = require("sleep");
var colorize = require("colorize");
const style = require("ansi-styles");
var currentdate = new Date();
var datetime =
  "Last Sync: " +
  currentdate.getDay() +
  "/" +
  currentdate.getMonth() +
  "/" +
  currentdate.getFullYear() +
  " @ " +
  currentdate.getHours() +
  ":" +
  currentdate.getMinutes() +
  ":" +
  currentdate.getSeconds();
var finalOutput = "./Logs/Output-" + currentdate + ".csv";
var rp = require("request-promise");

var responseArray = [];
var courseNumber;
var object;
var userString;
var Domain;

var apiGetQuizzes = function(domain, checkObject, string, userCourseNumber) {
  this.domain = domain;
  Domain = domain;
  this.checkObject = checkObject;
  this.string = string;
  userString = string;
  this.userCourseNumber = userCourseNumber;
  courseNumber = userCourseNumber;
  var that = this;
  var paginatedPage = 1;
  var AuthToken = token.token;

  this.apiCall = function() {

    object = "quizzes"

    var getList = { url: "https://" + domain + ".instructure.com/api/v1/courses/" + userCourseNumber + "/" + object + "?per_page=100&page=" + paginatedPage, headers: { Authorization: "Bearer " + AuthToken }, method: "GET" };

    request(getList, function(error, response, body) {

      var ApiResponse = JSON.parse(body);

      for (i = 0; i < ApiResponse.length; i++) {
          var url = ApiResponse[i].id;
        responseArray.push(url);
      }


      if (ApiResponse.length > 0) {
        paginatedPage++;
        that.apiCall();
      } else {
        console.log("\n \n");
        console.log("Done finding all of the", style.color.ansi16m.hex("#ff0000 ") + object + style.color.close + " in this course.");
        console.log("I found a total of", responseArray.length, "Items.");
        console.log("Starting a search for items containing", style.color.ansi16m.hex("#ff0000 ") + string + style.color.close + "\n");
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        console.log("\n \n");

        apiGETindividual();
      }
    });
  };
};

var apiGETindividual = function(domain, checkObject, string, userCourseNumber) {
  var that = this;
  var paginatedPage = 1;
  var AuthToken = token.token;
  var incrementer = 0;
  for (i = 0; i < responseArray.length; i++) {
    var pageNumber = 0;
    var options = { uri: "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/" + object + "/" + responseArray[incrementer], qs: { Authorization: "Bearer " + AuthToken }, headers: { "User-Agent": "Request-Promise", Authorization: "Bearer " + AuthToken }, json: true }; // Automatically parses the JSON string in the response
    
    rp(options)
      .then(function(repos) {


        pageNumber++;
        var success = colorize.ansify("#green[Quiz Successfully Checked]");
        console.log(success,pageNumber,"/",responseArray.length)
        
        var success = colorize.ansify("#green[Successfully Checked]");
        var apiSlow1 = colorize.ansify("#red[Reaching the API Limit -- Slowing Down]");
        var apiSlow2 = colorize.ansify("#red[HEAVY API USAGE-- THROTTLING DOWN]");
        var individualAPIresponse = repos;
        var url = individualAPIresponse.id;
          title = individualAPIresponse.title;
          questionCount = individualAPIresponse.question_count



          

          var questionsAPI = { uri: "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/" + object + "/" + url + "/questions", qs: { Authorization: "Bearer " + AuthToken }, headers: { "User-Agent": "Request-Promise", Authorization: "Bearer " + AuthToken }, json: true };


          rp(questionsAPI)
            .then(function(questionItems){

              sleep.sleep(1)


                
                var questionsIDarray = []
                for( i=0; i< questionItems.length; i++){
                    questionsIDarray.push(questionItems[i].id)
                }

                for(j=0; j<questionsIDarray.length; j++){

                var individualQuestions = { uri: "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/" + object + "/" + url + "/questions/"+questionsIDarray[j], qs: { Authorization: "Bearer " + AuthToken }, headers: { "User-Agent": "Request-Promise", Authorization: "Bearer " + AuthToken }, json: true };
                var finalURL = "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/" + object + "/" + url
                
                rp(individualQuestions)
                    .then(function(questionId){

                        var questionType = questionId.question_type

                        if(questionType === "multiple_choice_question" || questionType === "true_false_question" || questionType === "multiple_answers_question"){

                            var questionText = questionId.question_text
                            var answersLength = questionId.answers.length
                            var correctComments = questionId.correct_comments_html
                            var incorrectComments = questionId.incorrect_comments_html
                            var neutralComments = questionId.neutral_comments_html


                            // if( correctComments !== undefined){
                            // if (correctComments.indexOf(userString) !== -1)  {
                            //     console.log("=======================================================================================================\n");
                            //     console.log("Found it on one of the",style.color.ansi16m.hex("#0083BB") + "Correct Answer Feedbacks" + style.color.close ,"of the Quiz Located Here:", style.color.ansi16m.hex("#E06666") + finalURL + style.color.close, "\n");
                            //     console.log("=======================================================================================================\n");
                            //     fs.appendFile(finalOutput,finalURL + "," + "'" + userString + "' \n",
                            //       function(err) {
                            //         if (err) {
                            //           console.log(err);
                            //         } else {
                            //         }
                            //       }
                            //     );
                            //   }
                            // }

                            // if( incorrectComments !== undefined){
                            //     if (incorrectComments.indexOf(userString) !== -1)  {
                            //         console.log("=======================================================================================================\n");
                            //         console.log("Found it on one of the",style.color.ansi16m.hex("#0083BB") + "Incorrect Answer Feedbacks" + style.color.close ,"of the Quiz Located Here:", style.color.ansi16m.hex("#E06666") + finalURL + style.color.close, "\n");
                            //         console.log("=======================================================================================================\n");
                            //         fs.appendFile(finalOutput,finalURL + "," + "'" + userString + "' \n",
                            //           function(err) {
                            //             if (err) {
                            //               console.log(err);
                            //             } else {
                            //             }
                            //           }
                            //         );
                            //       }
                            //     }

                            //     if( neutralComments !== undefined){
                            //         if (neutralComments.indexOf(userString) !== -1)  {
                            //             console.log("=======================================================================================================\n");
                            //             console.log("Found it on one of the",style.color.ansi16m.hex("#0083BB") + "Neutral Answer Feedbacks" + style.color.close ,"of the Quiz Located Here:", style.color.ansi16m.hex("#E06666") + finalURL + style.color.close, "\n");
                            //             console.log("=======================================================================================================\n");
                            //             fs.appendFile(finalOutput,finalURL + "," + "'" + userString + "' \n",
                            //               function(err) {
                            //                 if (err) {
                            //                   console.log(err);
                            //                 } else {
                            //                 }
                            //               }
                            //             );
                            //           }
                            //         }

                            // if(questionText !== undefined){
                            //   if (questionText.indexOf(userString) !== -1) {
                            //     console.log("=======================================================================================================\n");
                            //     console.log("Found it on one of the",style.color.ansi16m.hex("#0083BB") + "Question Body's" + style.color.close ,"of the Quiz Located Here:", style.color.ansi16m.hex("#E06666") + finalURL + style.color.close, "\n");
                            //     console.log("=======================================================================================================\n");
                            //     fs.appendFile(finalOutput,finalURL + "," + "'" + userString + "' \n",
                            //       function(err) {
                            //         if (err) {
                            //           console.log(err);
                            //         } else {
                            //         }
                            //       }
                            //     );
                            //   }
                            // }



                              for(q=0; q< answersLength; q++){

                                var answerCheck = questionId.answers[q].text

                                if (answerCheck.indexOf(userString) !== -1) {
                                    console.log("=======================================================================================================\n");
                                    console.log("Found it inside of",style.color.ansi16m.hex("#0083BB") + "a Question Answer"+ style.color.close,"in the Quiz Located Here:", style.color.ansi16m.hex("#E06666") + finalURL + style.color.close, "\n");
                                    console.log("=======================================================================================================\n");
                                    fs.appendFile(finalOutput,individualQuestions.uri + "," + "'" + userString + "' \n",
                                      function(err) {
                                        if (err) {
                                          console.log("Error Adding to File", err);
                                        } else {
                                        }
                                      }
                                    );
                                  }
                              }


                        }// END OF MULTIPLE CHOICE
                    



                    })
                    .catch(function(questionError){
                        //console.log("Individual Questions Error:", questionError.message)

                    })
                }

            })
            .catch(function(err){
                //console.log("Total Questions Error:", err.message)
            })


            
      })
      .catch(function(err) {
        var apiSlow1 = colorize.ansify("#red[Reaching the API Limit -- Slowing Down]");
        //console.log(apiSlow1)
        //sleep.sleep(3)
        // var apiSlow2 = colorize.ansify("#red[HEAVY API USAGE-- THROTTLING DOWN]");
        // console.log("===================================");
        // var errMessage = err.response.headers.status;
        // var errHeaders = err.response.headers["x-rate-limit-remaining"];
        // console.log("rejected:", errMessage);
        // console.log("Remaining API:", errHeaders);
        // if (errHeaders < 30) {
        //   //console.log(apiSlow1);
        //   //sleep.sleep(10);
        // }
      });
    incrementer++;
  }
};


  module.exports = apiGetQuizzes;