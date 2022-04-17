
var increaseBtnArray = document.querySelectorAll(".increase");
var decreaseBtnArray = document.querySelectorAll(".decrease");
var removeCartBtnArray = document.querySelectorAll(".removeFromCart")

increaseBtnArray.forEach(function(increaseBtn){
    increaseBtn.addEventListener("click",increaseBtnClicked())
})

decreaseBtnArray.forEach(function(decreaseBtn){
    decreaseBtn.addEventListener("click",decreaseBtnClicked())
})

removeCartBtnArray.forEach(function(btn){
    btn.addEventListener("click",removeCartClicked());
})

function removeCartClicked(){
    return function(event){
        var info = {
            product_id : event.target.parentNode.getAttribute("id")
        };
        var request = new XMLHttpRequest();
        request.open("post","/removeFromCart");
        request.setRequestHeader("Content-type","application/json");
        request.send(JSON.stringify(info));

        request.addEventListener("load",function(){
            if(request.status==404){
                alert("Failed to reomve quantity");
            }
            else{
                var grandParent = event.target.parentNode.parentNode;
                grandParent.removeChild(event.target.parentNode);
            }
        })
    }

}

function increaseBtnClicked(){
    return function(event){
        var quantityNode = event.target.parentNode.children[1];

        quantityNode.innerText = parseInt(quantityNode.innerText)+1;

        var information = {
            product_id : event.target.parentNode.parentNode.getAttribute("id"),
            quantity : quantityNode.innerText,
            operation : "I"
        }

        var request = new XMLHttpRequest();
        request.open("post","/updateQuantity");
        request.setRequestHeader("Content-type","application/json");
        request.send(JSON.stringify(information));

        request.addEventListener("load",function(){
            if(request.status==404){
                alert("Failed to increse quantity");
            }
        })
    }
}

function decreaseBtnClicked(){
    return function(event){
        var quantityNode = event.target.parentNode.children[1];
        if(parseInt(quantityNode.innerText)<=1){
            alert("quantity cannot be less than 1");
            return;
        }        

        var information = {
            product_id : event.target.parentNode.parentNode.getAttribute("id"),
            quantity : parseInt(quantityNode.innerText)-1,
            operation : "D"
        }

        var request = new XMLHttpRequest();
        request.open("post","/updateQuantity");
        request.setRequestHeader("Content-type","application/json");
        request.send(JSON.stringify(information));

        request.addEventListener("load",function(){
            if(request.status==422){
                alert("Quantity cannot be less than one");
            }
            else{
                quantityNode.innerText = parseInt(quantityNode.innerText)-1;
            }
            
        })
    }
}

