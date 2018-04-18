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
var finalOutput = "./Logs/Rollback/Output-" + currentdate + ".csv";
var rp = require("request-promise");

let responseArray = [];
let courseNumber;
let Domain;
let RevertOption;

//########################################################################################################################################//
///// THIS FUNCTION IS DESIGNED TO FIND ALL THE CONTENT PAGES IN A COURSE AND ADD THEIR URL TO THE 'responseArray' TO LATER LOOP OVER///////
//########################################################################################################################################//

var apiGet = function(domain, userCourseNumber, revertOption) {
    var that = this;
    var paginatedPage = 1;
    var AuthToken = token.token;
    this.domain = domain;
    Domain = domain;
    this.userCourseNumber = userCourseNumber;
    courseNumber = userCourseNumber;
    this.revertOption = revertOption
    RevertOption = revertOption

    this.apiCall = function(global) {


        var getList = {
            url: "https://" + domain + ".instructure.com/api/v1/courses/" + userCourseNumber + "/pages?per_page=100&page=" + paginatedPage,
            headers: {Authorization: "Bearer " + AuthToken},
            method: "GET"
        };

        request(getList, function(error, response, body) {
            var ApiResponse = JSON.parse(body);

            for (i = 0; i < ApiResponse.length; i++) {
                    var url = ApiResponse[i].url;
                    responseArray.push(url);
            }

            //since api responses are limited to 100 results, we check to see if there are more than 100 and rerun the function if there is
            if (ApiResponse.length > 0) {
                paginatedPage++;
                that.apiCall();
            } else {
                console.log("\n \n");
                console.log("Done finding all of the", style.color.ansi16m.hex("#ff0000 ") + "Content Pages" + style.color.close + " in this course.");
                console.log("I found a total of", responseArray.length, "Content Pages.");
                if(!global){
                console.log("\n \n");
                console.log(style.color.ansi16m.hex("#ff0000 ") + "Reverting All Changes on Content Pages" + style.color.close);
                console.log("\n \n");
                }
                dataFinder();
            }
        });
    };
};

//########################################################################################################################################//
//########################################################################################################################################//
//########################################################################################################################################//

async function dataFinder() {

    var AuthToken = token.token;
    var pageNumber = 0
    fs.appendFile(finalOutput, "canvas_url, roll_back_id\n", function(err) {});

    let array = responseArray.map(title => {

        let titleURL = title

        var options = {
            method: "get",
            url: "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/pages/" + title + "/revisions",
            qs: { Authorization: "Bearer " + AuthToken }, headers: { "User-Agent": "Request-Promise", Authorization: "Bearer " + AuthToken },
            json: true
        };

        async function getData() {
            var successMessage = colorize.ansify("#green[Successfully Restored]");
            var errorMessage = colorize.ansify("#red[Encountering Troubles]");
            let revisionId;
            

            let data = await axios(options).then(function(response) {

                
                if(RevertOption === "Revert 1"){
                    revisionId = response.data[1].revision_id
                }else if( RevertOption === "Start Me From The Beginning"){
                    revisionId = response.data[response.data.length-1].revision_id
                }else{
                    console.log("UH OH.  THERE WAS A PROBLEM ON LINE 110")
                }


                 let normalPageUrl = "https://" + Domain + ".instructure.com/courses/" + courseNumber + "/pages/" + titleURL;


                        if(response.headers['x-rate-limit-remaining'] > 10){

                                            var updateOptions = {
                                                method: "post",
                                                url: "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/pages/" + titleURL +"/revisions/"+ revisionId,
                                                qs: { Authorization: "Bearer " + AuthToken },headers: { "User-Agent": "Request-Promise", Authorization: "Bearer " + AuthToken, "Content-Type": "application/json" },
                                                data:{"revision_id": revisionId}
                                            };
        
                                            axios(updateOptions).then(function(response){
                                                if(response.headers['x-rate-limit-remaining'] > 10 && response.status === 200){

                                                    console.log(successMessage + " " + title)
                                                    fs.appendFile(finalOutput, titleURL +"," + revisionId + "\n", function(err) {});


                                                }else{
                                                  console.log("Error on Line 130")
                                                  getData()
                                                }
        
                                            }).catch(function(err){
                                                getData()
                                            })
        
                    }else{
                        getData()
                    }


            }).catch(function(err) {
                console.log("Error on Line 136")
                getData()
            })
        }
        return (
            getData()
        )
    })
}

module.exports = apiGet;