
// $('#myModal').on('shown.bs.modal', function () {


// })
//import {server} from '../../ftp.js';

$(document).on("click", "a", function (event) {
    console.log(document.cookie);

    let title = this.getAttribute("href");
    $("#exampleModalLabel").text(title);
   // let path = "file:///home/mikesb/temp/"+title;
    $('<img />').attr('src', "" + path + "")         // ADD IMAGE PROPERTIES.
        .attr('title', title)
        .width('113px').height('113px')

    .appendTo($('.modal-body'));      

});