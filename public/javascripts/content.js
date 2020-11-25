
$(document).ready(function () {



    $('.close').on('click', () => {

        $('.modal').modal('hide');
        $('.modal-body').empty();
    });
    $('#close').on('click', () => {

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
                // res.text().then(text=>{
                //     console.log(text);
                // })


                res.json().then(json => {
                    if (json) {
                        console.log(json);
                        $('.modal').modal('show')
                        $('.modal-title').text(json.filename);
                        if (json.type == "txt") {

                            $('.modal-body').append('<p>' + json.data + '</p>')

                        }
                        else if (json.type== "mp4") {
                            
                            $('.modal').modal('show')
                            console.log('in video');
                            $('.modal-body').append(`<video controls>
                                <source src="data:video/${json.ending};base64,${json.data}" type="video/mp4"/>
                                <!-- fallback -->
                                Your browser does not support the <code>video</code> element.
                            </video>`)
                        }
                        else{
                                let img = $(`<img style="max-width: 100%;
                                max-height: 100%;" alt=${json.filename}>`);
                                img.attr("src", `data:image/${json.ending};base64,${json.data}`);
                                $('.modal-body').append(img);
                        }
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