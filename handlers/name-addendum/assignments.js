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
var CSVOUTPUT = "./Logs/HeadersFooters/Output-" + currentdate + ".csv";
var rp = require("request-promise");

var responseArray = [];
var courseNumber;
var userString;
var Domain;
var pointsPossible; 

var apiGet = function(domain, userCourseNumber, pointValue) {

    this.domain = domain;
    Domain = domain;
    this.userCourseNumber = userCourseNumber;
    courseNumber = userCourseNumber;
    this.pointValue = pointValue 
    pointsPossible = pointValue

    var that = this;
    var paginatedPage = 1;
    var AuthToken = token.token;



    this.apiCall = function() {


        var getList = {
            url: "https://" + domain + ".instructure.com/api/v1/courses/" + userCourseNumber + "/assignments?per_page=100&page=" + paginatedPage,
            headers: {
                Authorization: "Bearer " + AuthToken
            },
            method: "GET"
        };


        request(getList, function(error, response, body) {
            var ApiResponse = JSON.parse(body);

            for (i = 0; i < ApiResponse.length; i++) {
                var discussion = false
                var quiz = false

                if ('discussion_topic' in ApiResponse[i]){discussion = true}

                    if(ApiResponse[i].is_quiz_assignment === true || discussion === true){

                    }else{
                        var assignmentId = ApiResponse[i].id;
                        responseArray.push(assignmentId);
                    }
              }

            if (ApiResponse.length > 0) {
                paginatedPage++;
                that.apiCall();
            } else {
                console.log("\n \n");
                console.log("Done finding all of the Content Pages in this course.");
                console.log("I found a total of", responseArray.length, "Assignments that are being updated.");
                console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                console.log("\n \n");
                console.log(style.color.ansi16m.hex("#ff0000 ") + "Changing Assignment Names and Point Values" + style.color.close);
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
            uri: "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/assignments/" + id,
            qs: { Authorization: "Bearer " + AuthToken },
            headers: { "User-Agent": "Request-Promise", Authorization: "Bearer " + AuthToken },
            json: true
        };


        async function getData() {

            var successMessage = colorize.ansify("#green[Successfully Checked]");
            let data = await rp(options).then(function(response) {

                let titleURL = response.id;
                let body = response.body;
                let name = response.name;

                var normalPageUrl = "https://" + Domain + ".instructure.com/courses/" + courseNumber + "/assignments/" + titleURL;
                        
                        var newName = name + " - Assessement"
                                    
                                            var updateOptions = {
                                                    method: "put",
                                                    url: "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/assignments/" + titleURL,
                                                    qs: { Authorization: "Bearer " + AuthToken },
                                                    headers: { "User-Agent": "Request-Promise", Authorization: "Bearer " + AuthToken, "Content-Type": "application/json" },
                                                    data:{
                                                        "assignment": {
                                                            "name": newName,
                                                            "points_possible": pointsPossible
                                                        }
                                                    }
                                                };


                                        axios(updateOptions).then(function(response){

                                            if (response.data.name === name){
                                                console.log("\n\n**********************************************************************")
                                                console.log("Tried to update the page:", style.color.ansi16m.hex("#E06666") + name + style.color.close, "Located Here:", style.color.ansi16m.hex("#E06666") + normalPageUrl + style.color.close, "\n");
                                                console.log("But Nothing Actually Updated.  Please Manually Check.")
                                                console.log("**********************************************************************\n\n")
                                            }else{

                                            // fs.appendFile(CSVOUTPUT, normalPageUrl + "," + "'" + Header + "," + Footer +"' \n", function(err) {
                                            //     if (err) {
                                            //         console.log(err);
                                            //     } else {}
                                            // });

                                            console.log("=======================================================================================================\n");
                                            console.log("Updated this page:", style.color.ansi16m.hex("#E06666") + name + style.color.close, "Located Here:", style.color.ansi16m.hex("#E06666") + normalPageUrl + style.color.close, "with a New Name and Point Value\n");
                                        }

                                        }).catch(function(err){
                                            console.log(err)
                                            // getData()
                                        })


            }).then(function(){

            }).catch(function(err) {
                console.log(err)
                // getData()
            })
        }

        return (
            getData()
        )
    })

}


module.exports = apiGet;