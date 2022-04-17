var addProduct = document.getElementById("addProduct");
var logoutBtn = document.getElementById("logout");
var editBtnArray = document.querySelectorAll(".editProduct");
var deleteBtnArray = document.querySelectorAll(".deleteProduct");


editBtnArray.forEach(function(btn){
    btn.addEventListener("click",editBtnClicked());
})

deleteBtnArray.forEach(function(data){
    data.addEventListener("click",deleteBtnClicked());
})


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

addProduct.addEventListener("click",addProductClicked());



function addProductClicked(){
    return function(event){
        window.location.href = "/addProductPage";
    }
}

function editBtnClicked(){
    return function(event){
        var product_id = event.target.parentNode.parentNode.getAttribute("id");

        var url = "/editProductPage/"+ product_id;
        window.location.href = url;
        
    }
}

function deleteBtnClicked(){
    return function(event){
        var product_id = event.target.parentNode.parentNode.getAttribute("id");

        var request = new XMLHttpRequest();
        request.open("DELETE","/ProductManipulate");
        request.setRequestHeader("Content-type","application/json");
        request.send(JSON.stringify( { id : product_id}));

        request.addEventListener("load",function(){
            if(request.status==200){

                var grandParent = event.target.parentNode.parentNode.parentNode
                grandParent.removeChild(event.target.parentNode.parentNode);

                alert("Product Deleted Succesfully");
            }
            else{
                alert("Failed to delete the product");
            }
        })
    }
}