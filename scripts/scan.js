//Node List of all that image instances
imageScan = document.querySelectorAll("img");

console.log(imageScan);

countNoAlt = 0;

altText = "";



//For loop that adds and collects the images with no alt text
for (let i = 0; i < imageScan.length; i++){
    if(imageScan[i].alt === ""){
        countNoAlt += 1;
        altText[i] = imageScan[i].alt;
    
    }
}

chrome.storage.local.set({noAlt: countNoAlt}).then(()=>{
    console.log(`Lack of Alt Text value is set at ${countNoAlt}`);
});