$(document).ready(function() {



    $('.close').on('click', () => {

        $('.modal').modal('hide');
        $('.modal-body').empty();
    });
    $('#close').on('click', () => {

        $('.modal').modal('hide');
        $('.modal-body').empty();
    });

    $('#json_button').on('click', function(e) {
        console.log("SAVING JSON")

        let basedir = $('#basedir').text();

        if ($('#description_text')) {

            let description_text = $('#description_text').val();
            let description_title = $('#description_title').val();
            let json_data = { description: description_text.trim() , title:description_title.trim()};
            console.log(json_data)
            fetch("/json_save", {
                method: 'POST',
                credentials: 'same-origin',
                cors: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ basedir, json_data })
            }).then(res => {
                console.log("JSON SAVED")
                $('.modal').modal('hide');
                $('.modal-body').empty();
            });
        }

    });

    $('input').on('click', function(e) {
        e.preventDefault();
        console.log(e)
        let dirname;
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

                        } else if (json.type == "mp4") {

                            $('.modal').modal('show')
                            console.log('in video');
                            $('.modal-body').append(`<video controls>
                                <source src="data:video/${json.ending};base64,${json.data}" type="video/mp4"/>
                                <!-- fallback -->
                                Your browser does not support the <code>video</code> element.
                            </video>`)
                        } else if (json.type == "json") {
                            if (json.data.description) {
                                let title =json.data.title;
                                if(title==null)
                                {
                                    title =""
                                }
                                let descr =json.data.description.trim();
                                $('.modal-body').append(`
                                <div class="col">
                                    <div class="row">
                                        <input id="description_title" placeholder="Title" type="text" name="description_title" value=${title} >
                                    </div>
                                    <div class="row">
                                        <textarea id="description_text" name="description_text"
                                    rows="5" cols="33">
                                            ${descr}
                                        </textarea>
                                    </div>
                                </div>
                                
                                `)
                              //  $('.modal-body').append(``)
                            } else {
                                $('.modal-body').append(`
                                <div class="col">
                                    <div class="row">
                                        <input id="description_title" placeholder="Title" type="text" name="description_title" >
                                    </div>
                                    <div class="row">
                                        <textarea id="description_text" name="description_text"
                                    rows="5" cols="33" type="text" placeholder="Description">
                                           
                                        </textarea>
                                    </div>
                                </div>
                                
                                `)
                            }

                        } else {
                            let img = $(`<img style="max-width: 100%;
                                max-height: 100%;" alt=${json.filename}>`);
                            img.attr("src", `data:image/${json.ending};base64,${json.data}`);
                            $('.modal-body').append(img);
                        }
                    }


                });

            }



            if (res.status == 404) {
                res.text().then(function(text) {
                    console.log(text)
                        //  $(".error").append(text)
                });
            }


        }).catch((error) => {
            console.error('Error:', error);
        });


    });

    $('#upload').on('click', function(e) {
        e.preventDefault();
        console.log(e)
        let basedir = $('#basedir').text();;
        console.log("Clicked");
        console.log(basedir);
        let file = $('#inputFile').val();
        console.log(document.files.inputFile.value);
        //  console.log(document.files.test.value);
        // console.log(document.formname.files);


        fetch("/post_file", {
            method: 'POST',
            credentials: 'same-origin',
            cors: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ file, basedir })
        }).then(res => {
            console.log("Request complete! response:", res);
            if (res.status == 200) {
                window.location.href = res.redirected;

            }



            if (res.status == 404) {
                res.text().then(function(text) {
                    console.log(text)
                        //  $(".error").append(text)
                });
            }


        }).catch((error) => {
            console.error('Error:', error);
        });


    });
});