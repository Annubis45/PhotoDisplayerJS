
var isActive=false;
function showmenu()
{
    console.log((new Date()).toUTCString()+' - ' +"showmenu");
    if(isActive)
    {
        document.getElementById("wrapper").classList.remove("active");
    }else{
        document.getElementById("wrapper").classList.add("active");
    }
    isActive=!isActive;
    setTimeout(hidemenu,3000);
}

function hidemenu()
{
    document.getElementById("wrapper").classList.remove("active");
    isActive=false;
}
