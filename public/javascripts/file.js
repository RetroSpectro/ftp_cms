
var form = document.getElementById("myForm");

form.addEventListener('submit', function(ev){ 
  
    ev.preventDefault(); 

    var myFile = document.getElementById('file').files[0];
    var h1 = document.getElementsByTagName("h1")[0].id;
    
    console.log(h1); 
    var oData = new FormData(form);
    var oReq = new XMLHttpRequest();
    for (var pair of oData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
    }
     //
    oReq.open("POST","/dirs/" + h1+"post_file",true);  
      oReq.send(oData);
    oReq.onload = function(oEvent){
        if(oReq.status == 200) {
            console.log("success",oEvent);
            console.log(oReq.response); //
        } else {
            console.log("fail",oEvent);
        }
    }
   

   
},false);

