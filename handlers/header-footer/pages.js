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

var apiGet = function(domain, userCourseNumber, headerFileNumber, footerFileNumber) {

    this.domain = domain;
    Domain = domain;
    this.userCourseNumber = userCourseNumber;
    courseNumber = userCourseNumber;
    this.headerFileNumber = headerFileNumber.trim()
    HeaderFileNumber = headerFileNumber.trim()
    this.footerFileNumber = footerFileNumber.trim()
    FooterFileNumber = footerFileNumber.trim()

    var that = this;
    var paginatedPage = 1;
    var AuthToken = token.token;



    this.apiCall = function() {


        var getList = {
            url: "https://" + domain + ".instructure.com/api/v1/courses/" + userCourseNumber + "/pages?per_page=100&page=" + paginatedPage,
            headers: {
                Authorization: "Bearer " + AuthToken
            },
            method: "GET"
        };

        request(getList, function(error, response, body) {
            var ApiResponse = JSON.parse(body);

            for (i = 0; i < ApiResponse.length; i++) {
                    var url = ApiResponse[i].url;
                    responseArray.push(url);
              }

            if (ApiResponse.length > 0) {
                paginatedPage++;
                that.apiCall();
            } else {
                console.log("\n \n");
                console.log("Done finding all of the Content Pages in this course.");
                console.log("I found a total of", responseArray.length, "Pages.");
                console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                console.log("\n \n");
                console.log(style.color.ansi16m.hex("#ff0000 ") + "Adding Headers and Footers" + style.color.close);
                console.log("\n \n");
                dataFinder();
            }
        });
    };
};

async function dataFinder() {
    var AuthToken = token.token;
    var pageNumber = 0

    let array = responseArray.map(title => {

        var options = {
            uri: "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/pages/" + title,
            qs: { Authorization: "Bearer " + AuthToken },
            headers: { "User-Agent": "Request-Promise", Authorization: "Bearer " + AuthToken },
            json: true
        };


        async function getData() {

            var successMessage = colorize.ansify("#green[Successfully Checked]");
            let data = await rp(options).then(function(response) {

                let titleURL = response.url;
                let body = response.body;
                let title = response.title;

                var normalPageUrl = "https://" + Domain + ".instructure.com/courses/" + courseNumber + "/pages/" + titleURL;
                var Header = `<div class="canvas-header"><img src="https://${Domain}.instructure.com/courses/${courseNumber}/files/${HeaderFileNumber}/download" alt="0.png" width="100%" height="77" data-api-endpoint="https://${Domain}.instructure.com/api/v1/courses/${courseNumber}/files/${HeaderFileNumber}" data-api-returntype="File" /></div>`
                var Footer = `<div class="canvas-footer"><img src="https://${Domain}.instructure.com/courses/${courseNumber}/files/${FooterFileNumber}/download" alt="0.png" width="100%" height="77" data-api-endpoint="https://${Domain}.instructure.com/api/v1/courses/${courseNumber}/files/${FooterFileNumber}" data-api-returntype="File" /></div>`
                        
                        var newBody = Header + body + Footer
                                    
                                            var updateOptions = {
                                                    method: "put",
                                                    url: "https://" + Domain + ".instructure.com/api/v1/courses/" + courseNumber + "/pages/" + titleURL,
                                                    qs: { Authorization: "Bearer " + AuthToken },
                                                    headers: { "User-Agent": "Request-Promise", Authorization: "Bearer " + AuthToken, "Content-Type": "application/json" },
                                                    data:{
                                                        "wiki_page": {
                                                            "body": newBody
                                                        }
                                                    }
                                                };

                                        axios(updateOptions).then(function(response){

                                            if (response.data.body === body){
                                                console.log("\n\n**********************************************************************")
                                                console.log("Tried to update the page:", style.color.ansi16m.hex("#E06666") + title + style.color.close, "Located Here:", style.color.ansi16m.hex("#E06666") + normalPageUrl + style.color.close, "\n");
                                                console.log("But Nothing Actually Updated.  Please Manually Check.")
                                                console.log("**********************************************************************\n\n")
                                            }else{

                                            fs.appendFile(CSVOUTPUT, normalPageUrl + "," + "'" + Header + "," + Footer +"' \n", function(err) {
                                                if (err) {
                                                    console.log(err);
                                                } else {}
                                            });

                                            console.log("=======================================================================================================\n");
                                            console.log("Updated this page:", style.color.ansi16m.hex("#E06666") + title + style.color.close, "Located Here:", style.color.ansi16m.hex("#E06666") + normalPageUrl + style.color.close, "with new Headers and Footers\n");
                                        }

                                        }).catch(function(err){
                                            getData()
                                        })


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