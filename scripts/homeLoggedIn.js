var logoutBtn = document.getElementById("logout");
var changePasswordBtn = document.getElementById("changePassword");
var myCartBtn = document.getElementById("myCart");


myCartBtn.addEventListener("click",myCartClicked());

logoutBtn.addEventListener("click",function(){
    console.log("clicked");
    var request = new XMLHttpRequest();
    request.open("GET","/logout");
    request.setRequestHeader("Content-type","application/json");
    request.send();

    request.addEventListener("load",function(){
        if(request.status != 200){
            alert("Logout failed");
        }
        else{
            window.location.href = request.responseText;
        }
    })
})

function myCartClicked(){
    return function(event){
        var request = new XMLHttpRequest();
        request.open("GET","/myCart");
        request.setRequestHeader("Content-type","applictaion/json");
        request.send();

        request.addEventListener("load",function(){
            if(request.status == 401){
                alert("Please Login");
            }
            else{
                window.location.href = request.responseText;
            }
        })
    }
}

changePasswordBtn.addEventListener("click",function(){
    var request = new XMLHttpRequest();
    request.open("GET","/changePasswordPage");
    request.setRequestHeader("Content-type","application/json");
    request.send();

    request.addEventListener("load",function(){
        window.location.href = request.responseText;
    })
})