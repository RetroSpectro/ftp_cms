
$(document).ready(function () {

    

    $('.close').on('click',()=>{

        $('.modal').modal('hide');
        $('.modal-body').empty();
    });
    $('#close').on('click',()=>{

        $('.modal').modal('hide');
        $('.modal-body').empty();
    });

    let dirname;
    $('input').on('click', function (e) {
        e.preventDefault();
        console.log(e)
        dirname = e.currentTarget.alt;
        console.log("Clicked");
        console.log(dirname);


        fetch("/content", {
            method: 'POST',
            credentials: 'same-origin',
            cors: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dirname })
        }).then(res => {
            console.log("Request complete! response:", res);
            if (res.status == 200) {
                res.json().then(json=>{
                    console.log(json);
                    $('.modal').modal('show')
                    $('.modal-title').text(json.filename);
                    if(json.type=="txt")
                    {
    
                        $('.modal-body').append('<p>'+json.data+'</p>')
    
                    }
                    if(json.type=="mp4")
                    {
                   
                         $('.modal-body').append('<video width="320" height="240" autoplay> <source src='+json.data+' type="video/mp4"></video>')
                    }
                    if(json.type=="other")
                    {
                        let img = $(`<img style="max-width: 100%;
                        max-height: 100%;" alt=${json.filename}>`);
                        img.attr("src",`data:image/${json.ending};base64,${json.data}`);
                        $('.modal-body').append(img);
                    }
                
                });
                
            }



            if (res.status == 404) {
                res.text().then(function (text) {
                    console.log(text)
                  //  $(".error").append(text)
                });
            }


        }).catch((error) => {
            console.error('Error:', error);
        });


    });

});