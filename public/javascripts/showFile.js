
// $('#myModal').on('shown.bs.modal', function () {


// })
//import {server} from '../../ftp.js';

$(document).on("click", "a", function (event) {
    console.log(document.cookie);

    let title = this.getAttribute("href");
    $("#exampleModalLabel").text(title);
   // window.location = `ftp://localhost:3001/home/mikesb/root/${title}`;
    //     let path = "file:///home/mikesb/temp/"+title;
    // $('<img />').attr('src', "" + path + "")         // ADD IMAGE PROPERTIES.
    //     .attr('title', title)
    //     .width('113px').height('113px')

    // .appendTo($('.modal-body'));      

// Script from http://ftp.apixml.net/
// Copyright 2017 http://ftp.apixml.net/, DO NOT REMOVE THIS COPYRIGHT NOTICE
// var Ftp = {
//     createCORSRequest: function (method, url) {
//         var xhr = new XMLHttpRequest();
//         if ("withCredentials" in xhr) {
//             // Check if the XMLHttpRequest object has a "withCredentials" property.
//             // "withCredentials" only exists on XMLHTTPRequest2 objects.
//             xhr.open(method, url, true);
//         } else if (typeof XDomainRequest != "undefined") {
//             // Otherwise, check if XDomainRequest.
//             // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
//             xhr = new XDomainRequest();
//             xhr.open(method, url);
//         } else {
//             // Otherwise, CORS is not supported by the browser.
//             xhr = null;
//         }
//         return xhr;
//     },
//     upload: function(token, files) {
//         var file = files;
//          function reader() {
//                 var base64 = this.result;               
//                 var xhr = Ftp.createCORSRequest('GET', "http://localhost:3001/home/mikesb/root/");
//                 if (!xhr) {
//                     throw new Error('CORS not supported');
//                 }
//                 xhr.onreadystatechange = function() {
//                     if (xhr.readyState == 4 && xhr.status == 200) {
//                         Ftp.callback(file);
//                     }
//                 };
//                 xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//                 xhr.send("token=" + token + "&data=" + encodeURIComponent(base64) + "&file=" + file);
//             }
//             reader();
//     },
//     callback: function(){}
// };
// Ftp.upload();
});



