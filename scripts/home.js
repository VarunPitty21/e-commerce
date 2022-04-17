
var productContainer = document.getElementById("productContainer");
var modal = document.getElementById("modal");
var closeBtn = document.getElementById("close");
var overlay = document.getElementById("overlay");
var loadMoreBtn = document.getElementById("loadMore");


var allAddToCart = document.querySelectorAll(".addToCart")
var allViewDetails = document.querySelectorAll(".viewDetails")


allAddToCart.forEach(function(element){
    //console.log(element);
    element.addEventListener("click",onAddToCartClicked());
})

allViewDetails.forEach(function(element){
    element.addEventListener("click",onViewDetailsClicked())
})

closeBtn.addEventListener("click",function(){
    modal.style.display = "none";
})

function onViewDetailsClicked(){
    return function(event){
        var product_id = event.target.parentNode.parentNode.getAttribute("id");
        var request = new XMLHttpRequest();
        request.open("post","/getProduct");
        request.setRequestHeader("Content-type","application/json");
        request.send(JSON.stringify({ id : product_id}));

        request.addEventListener("load",function(){
            if(request.status==404){
                alert("Something went wrong");
            }
            else{
                var product = JSON.parse(request.responseText);
                console.log(product);
                modal.children[1].src = product.img ;
                modal.children[2].innerText = product.title;
                modal.children[3].innerText = product.description;

                modal.style.display = "inline";
            }
        })
        
    }
}

function onAddToCartClicked(){
    return function(event){

        var id  = {
            id : event.target.parentNode.parentNode.getAttribute("id")
        };
        console.log(id);
        var request = new XMLHttpRequest();
        request.open("post","/addToCart");
        request.setRequestHeader("Content-type","application/json");
        request.send(JSON.stringify(id));

        request.addEventListener("load",function(){
            if(request.status==200){
                alert("Added to cart");
            }
            else if(request.status==409){
                alert("Item already In cart");
            }
            else if(request.status==401){
                alert("Unauthorized user!! Login/SignUp to add to cart");
            }
            else{
                alert("Something went wrong")
            }
        })
    }
}

loadMoreBtn.addEventListener("click",function(){
    var request = new XMLHttpRequest();
    request.open("GET","/loadMore");
    request.setRequestHeader("Content-type","application/json");
    request.send();
    
    request.addEventListener("load",function(){
        if(request.status!=200){
            alert("falied to load more products")
        }
        else{
            window.location.href = request.responseText
        }
    })
})

