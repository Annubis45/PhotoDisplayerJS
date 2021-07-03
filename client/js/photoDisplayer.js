

function SetImage(imageid)
{
    console.log((new Date()).toUTCString()+' - ' +'new Image:  '+ imageid);
    if(imageid!=undefined && imageid!=0){
        console.log((new Date()).toUTCString()+' - ' +'new Image:  '+ imageid);
        currentPhotoId=imageid;
        /*Image3 = new Image();
        Image3.src = "image?idcurrent=" + imageid;
        Image3.onload = (x => document.getElementById("image").src = "image?idcurrent=" + imageid);*/
        document.getElementById("image").src = "image?idcurrent=" + currentPhotoId;
    }
}

function Previous() {
    SetImage(PopImageFromBuffer());
    lastRefresh=Date.now();
}

function Next(forced) {
    console.log((new Date()).toUTCString()+' - ' +forced + ' ' + lastRefresh + '  '+ Date.now());
    if(!forced&&((Date.now()<RefreshTime+lastRefresh)))
        return;
   
    SetImage(NextImageFromBuffer());
    AddImageInBuffer((imagesBufferPosition+imagesBufferPrev)%imagesBufferSize);
    lastRefresh=Date.now();
}
    

function Like() {
    if(currentPhotoId==0)
        return;
    request("like",null);
}

function Dislike() {
    if(currentPhotoId==0)
        return;
    request("dislike",null);
}

function Ban() {
    if(currentPhotoId==0)
        return;
    request("ban",next);
}

function request(fonction, onsuccess)
{
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if(onsuccess)
                onsuccess(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", fonction+"?idcurrent="+currentPhotoId, true);
    xmlhttp.send();
}

function Init(RefreshTime) {
    /*window.onload = function () { SetDim("image") };
    window.onresize = function () { SetDim("image") };*/
    for(var i=0;i<imagesBufferPrev;i++)
    {
        AddImageInBuffer(i);
    }
    window.setInterval("Next(false)", RefreshTime);
    Next(true);
    //window.scrollTo(0, 1);
}

function AddImageInBuffer(position)
{
    request("next",function(imageid){
        imageBuffer[position]=imageid;
        preloadImage("image?idcurrent=" + imageid,imageid);
    });
}

function PopImageFromBuffer()
{
    imagesBufferPosition=(imagesBufferPosition-1)%imagesBufferSize;
    return imageBuffer[imagesBufferPosition];
}

function NextImageFromBuffer()
{
    imagesBufferPosition=(imagesBufferPosition+1)%imagesBufferSize;
    return imageBuffer[imagesBufferPosition];
}

function preloadImage(url, idImage)
{
    console.log("Preloading : " + url);
    var img=new Image();
    img.src=url;
}

var currentPhotoId=0;
var imagesBufferPosition=-1;
var imageBuffer = new Array();
var imagesBufferSize=30;
var imagesBufferPrev=3;
var RefreshTime=5000
var lastRefresh=Date.now();
Init(RefreshTime);



