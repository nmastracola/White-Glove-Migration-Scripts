var token = require("../config.js");
const inquirer = require("inquirer");
const https = require("https");
const request = require("request");
const $ = require("jquery");
const LineByLineReader = require("line-by-line");
const fs = require("fs");
const axios = require("axios")
var colorize = require("colorize");
const style = require("ansi-styles");
var currentdate = new Date();
var datetime = "Last Sync: " + currentdate.getDay() + "/" + currentdate.getMonth() + "/" + currentdate.getFullYear() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
var CSVOUTPUT = "./Logs/Questions/Output-" + currentdate + ".csv";
var rp = require("request-promise");

var responseArray = [];
var courseNumber;
var userString;
var Domain;
var pointsPossible; 
var quizId;

var apiGet = function(domain, userCourseNumber, quizNumber, pointValue) {

    this.domain = domain;
    Domain = domain;
    this.userCourseNumber = userCourseNumber;
    courseNumber = userCourseNumber;
    this.pointValue = pointValue 
    questionPoint = pointValue
    this.quizNumber = quizNumber
    quizId = quizNumber

    var that = this;
    var paginatedPage = 1;
    var AuthToken = token.token;



    this.apiCall = function() {


        var getList = {
            url: "https://" + domain + ".instructure.com/api/v1/courses/" + userCourseNumber + "/quizzes/"+quizId+"/questions?per_page=100&page=" + paginatedPage,
            headers: {
                Authorization: "Bearer " + AuthToken
            },
            method: "GET"
        };


        request(getList, function(error, response, body) {
            var ApiResponse = JSON.parse(body);

            for (i = 0; i < ApiResponse.length; i++) {
                        var questionId = ApiResponse[i].id;
                        responseArray.push(questionId);
            }

            if (ApiResponse.length > 0) {
                paginatedPage++;
                that.apiCall();
            } else {
                console.log("\n \n");
                console.log("Done finding all of the Content Pages in this course.");
                console.log("I found a total of", responseArray.length, "questions that are being updated.");
                console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                console.log("\n \n");
                console.log(style.color.ansi16m.hex("#ff0000 ") + "Changing question Point Values" + style.color.close);
                console.log("\n \n");
                dataFinder();
            }
        });
    };
};

async function dataFinder() {
    var AuthToken = token.token;
    var pageNumber = 0

    let array = responseArray.map(id => {

        var options = {
            uri: "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/quizzes/" + quizId+"/questions/"+id,
            qs: { Authorization: "Bearer " + AuthToken },
            headers: { "User-Agent": "Request-Promise", Authorization: "Bearer " + AuthToken },
            json: true
        };


        async function getData() {

            var successMessage = colorize.ansify("#green[Successfully Checked]");
            let data = await rp(options).then(function(response) {

                let questionId = response.id;

                var normalPageUrl = "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/quizzes/" + quizId + "/questions/" + id;
                        
                                    
                                if(response.points_possible !== questionPoint){
                                            var updateOptions = {
                                                    method: "put",
                                                    url: "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/quizzes/" + quizId + "/questions/" + questionId,
                                                    qs: { Authorization: "Bearer " + AuthToken },
                                                    headers: { "User-Agent": "Request-Promise", Authorization: "Bearer " + AuthToken, "Content-Type": "application/json" },
                                                    data:{
                                                        "question": {
                                                            "points_possible": questionPoint
                                                        }
                                                    }
                                                };

                                    
                                        axios(updateOptions).then(function(response){

                                            // fs.appendFile(CSVOUTPUT, normalPageUrl + "," + "'" + quizId + "," + pointValue +"' \n", function(err) {
                                            //     if (err) {
                                            //         console.log(err);
                                            //     } else {}
                                            // });

                                            console.log("=======================================================================================================\n");
                                            console.log("Updated this question:", style.color.ansi16m.hex("#E06666") + id + style.color.close, "Located Here:", style.color.ansi16m.hex("#E06666") + normalPageUrl + style.color.close, "with a New Point Value\n");

                                        }).catch(function(err){
                                            getData()
                                        })
                                    }else{
                                        console.log("Same Point Value.  Not Updated.")
                                    }


            }).then(function(){

            }).catch(function(err) {
                getData()
            })
        }

        return (
            getData()
        )
    })

}


module.exports = apiGet;