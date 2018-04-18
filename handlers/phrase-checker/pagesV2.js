var token = require("../config.js");
const inquirer = require("inquirer");
const https = require("https");
const request = require("request");
const $ = require("jquery");
const LineByLineReader = require("line-by-line");
const fs = require("fs");
const axios = require("axios")
const sleep = require("sleep");
var colorize = require("colorize");
const style = require("ansi-styles");
var currentdate = new Date();
var datetime = "Last Sync: " + currentdate.getDay() + "/" + currentdate.getMonth() + "/" + currentdate.getFullYear() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
var finalOutputFind = "./Logs/Find/Output-" + currentdate + ".csv";
var finalOutputReplace = "./Logs/Replace/Output-" + currentdate + ".csv";
var rp = require("request-promise");

let responseArray = [];
let courseNumber;
let userString;
let Domain;
let ReplaceString;
let updateMe;
let SearchCaseSensitive;
let ReplaceCaseSensitive;


//########################################################################################################################################//
///// THIS FUNCTION IS DESIGNED TO FIND ALL THE CONTENT PAGES IN A COURSE AND ADD THEIR URL TO THE 'responseArray' TO LATER LOOP OVER///////
//########################################################################################################################################//

var apiGet = function(domain, checkObject, string, userCourseNumber, replaceString, update, replaceCaseSensitive, searchCaseSensitive) {
    var that = this;
    var paginatedPage = 1;
    var AuthToken = token.token;
    this.domain = domain;
    Domain = domain;
    this.string = string;
    userString = string;
    this.userCourseNumber = userCourseNumber;
    courseNumber = userCourseNumber;
    this.replaceString = replaceString
    ReplaceString = replaceString
    this.update = update
    updateMe = update

    this.searchCaseSensitive = searchCaseSensitive
    SearchCaseSensitive = searchCaseSensitive

    this.replaceCaseSensitive = replaceCaseSensitive
    ReplaceCaseSensitive = replaceCaseSensitive

    this.apiCall = function(global) {

        GlobalSearch = global

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
                console.log("Starting a search for items containing", style.color.ansi16m.hex("#ff0000 ") + string + style.color.close);
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
//// THIS FUNCTION GOES THROUGH THE CONTENT PAGES AND LOOKS FOR A MATCH BETWEEN THE SEARCH STRING AND WHAT IS ON THE CONTENT PAGES BODY ////
//########################################################################################################################################//

async function dataFinder() {

    var AuthToken = token.token;
    var pageNumber = 0
    fs.appendFile(finalOutputReplace, "canvas_url, searched_string, replaced_string, status\n", function(err) {});
    fs.appendFile(finalOutputFind, "canvas_url, searched_string\n", function(err) {});

    let array = responseArray.map(title => {

        var options = {
            method: "get",
            url: "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/pages/" + title,
            qs: { Authorization: "Bearer " + AuthToken }, headers: { "User-Agent": "Request-Promise", Authorization: "Bearer " + AuthToken },
            json: true
        };

        async function getData() {
            var successMessage = colorize.ansify("#green[Successfully Checked]");
            var errorMessage = colorize.ansify("#red[Encountering Troubles]");
            

            let data = await axios(options).then(function(response) {
                
                 let titleURL = response.data.url;
                 let body = response.data.body;
                 let title = response.data.title;
                 let normalPageUrl = "https://" + Domain + ".instructure.com/courses/" + courseNumber + "/pages/" + titleURL;
                 let bodyStringify;
                 let userStringify
                 let replaceStringify = JSON.stringify(ReplaceString)
                 var bodyCheck = body
                 var stringCheck = userString
                 var searchString = new RegExp('\\b' + userString + '\\b', "g");

                    if(response.headers['x-rate-limit-remaining'] > 10){
                        if (body !== null) {
                            /////////////////////  makes the 'replace' either case sensitive or case insensitive ///////////////////////////
                            if(!ReplaceCaseSensitive){
                                searchString = new RegExp('\\b' + userString + '\\b', "gi");
                            }
                            /////////// Converts Everything to Lowercase when searching for a match if it's *NOT* case senstive /////////////
                            if(!SearchCaseSensitive){
                                bodyCheck = body.toLowerCase()
                                stringCheck = userString.toLowerCase()
                             }
                            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                            if(bodyCheck.indexOf(stringCheck) !== -1){
                                var newBody = body.replace(searchString, ReplaceString)
                                    if(updateMe === true){
                                            var updateOptions = {
                                                method: "put",
                                                url: "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/pages/" + titleURL,
                                                qs: { Authorization: "Bearer " + AuthToken },headers: { "User-Agent": "Request-Promise", Authorization: "Bearer " + AuthToken, "Content-Type": "application/json" },
                                                data:{"wiki_page": {"body": newBody}}
                                            };
        
                                            axios(updateOptions).then(function(response){
                                            if(response.headers['x-rate-limit-remaining'] > 10 && response.status === 200){
                                                        if(response.data.body === body){
                                                                console.log("=======================================================================================================\n");
                                                                console.log("Found it on this page:", style.color.ansi16m.hex("#E06666") + title + style.color.close, "Located Here:", style.color.ansi16m.hex("#E06666") + normalPageUrl + style.color.close, "\n");
                                                                console.log(style.color.ansi16m.hex("#E06666") + "Did Not Replace due to Case Sensitivity settings" + style.color.close, )
                                                                console.log("=======================================================================================================\n");
                                                                fs.appendFile(finalOutputReplace, normalPageUrl + "," + "'" + userString + "," + ReplaceString +"'," + "DID NOT UPDATE\n", function(err) {});
                                                                fs.appendFile(finalOutputFind, normalPageUrl + "," + "'" + userString + ","+"' \n", function(err) {});
                                                        }else{
                                                                fs.appendFile(finalOutputReplace, normalPageUrl + "," + "'" + userString + "," + ReplaceString +"'," + "UPDATED\n", function(err) {});
                                                                fs.appendFile(finalOutputFind, normalPageUrl + "," + "'" + userString + ","+"' \n", function(err) {});
                                                                console.log("=======================================================================================================\n");
                                                                console.log("Found it on this page:", style.color.ansi16m.hex("#E06666") + title + style.color.close, "Located Here:", style.color.ansi16m.hex("#E06666") + normalPageUrl + style.color.close, "\n");
                                                                console.log("Replaced ", style.color.ansi16m.hex("#0DBC76") + userString + style.color.close, "With", style.color.ansi16m.hex("#0DBC76") + ReplaceString + style.color.close, )
                                                                console.log("=======================================================================================================\n");
                                                        }
                                                }else{
                                                        console.log(errorMessage, +  pageNumber + "/" + responseArray.length);
                                                        fs.appendFile(errorOutputReplace, normalPageUrl + "," + "'" + response.status + "' \n", function(err) {});
                                                        getData()
                                                }
        
                                            }).catch(function(err){
                                                getData()
                                            })
        
                                              } else{
                                                    console.log("=======================================================================================================\n");
                                                    console.log("Found it on this page:", style.color.ansi16m.hex("#E06666") + title + style.color.close, "Located Here:", style.color.ansi16m.hex("#E06666") + normalPageUrl + style.color.close, "\n");
                                                    console.log("=======================================================================================================\n");
                                                    fs.appendFile(finalOutputFind, normalPageUrl + "," + "'" + userString + ","+"' \n", function(err) {});
                                                }
                                }
                        } 

                    }else{
                        console.log("THERE WAS AN ERROR")
                        console.log(response.status)
                        console.log(response.headers['x-rate-limit-remaining'])
                        getData()
                    }
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