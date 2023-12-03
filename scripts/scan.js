imageScan = document.querySelectorAll("img");

console.log(imageScan);

countNoAlt = 0;

altText = "";

for (let i = 0; i < imageScame.length; i++){
    if(imageScan[i].alt === ""){
        countNoAlt += 1;
        altText[i] = imageScan[i].alt;
    
    }
}

chrome.storage.local.set({noAlt: countNoAlt}).then(()=>{
    console.log(`Lack of Alt Text value is set at ${countNoAlt}`);
});