document.addEventListener('DOMContentLoaded', function() {
    
    //On screen elements
    const btnColor = document.getElementById('btnColor');
    const btnText = document.getElementById('btnText');
    const colorPick = document.getElementById("colorpicker");
    const fntSelect = document.getElementById("fonts");
    const btnDecrease = document.getElementById("btnDecrease");
    const btnIncrease = document.getElementById("btnIncrease");
    const btnSave = document.getElementById('btnSave');
    const btnLoad = document.getElementById('btnLoad');
    const txtOut = document.getElementById('txtOut');
    const btnClear = document.getElementById('btnClear');
    const btnScan = document.getElementById('btnScan');
    const graySlide = document.getElementById('graySlide');
    const btnInfo = document.getElementById('btnInfo');
    const lblFontSize = document.getElementById('lblFontSize');


    let currTab;
    let fontCSS = "";

    let scriptResult; 

    const brightSelect = document.getElementById('myRange');

    //Font Object to save settings
    const fontObj = {
        size: 16,
        color: "",  //haven't finished this yet
        name: "",
        fontId: "",
    }

    //Color Object to save settings
    const colorObj = {
        bright: 100,
        background: "",
        grayscale: 0,
        colorId: "",
    }

    //Alt Text Object from Scan
    const altObj = {
        altNum: 0,
        altSrc: []
    }

    //Runs every time you click the extension button to get the current tab id
    getTabId();


    chrome.action.setBadgeText({ text: '' });

    

    
    btnInfo.addEventListener('click',()=>{
        chrome.tabs.create({
            url: "html/info.html"
          });
    });

    //Event Listener for the slider, changes brightness values
    brightSelect.addEventListener('input',()=>{
        setPageBrightness(brightSelect.value);
    });

    //Event listener for the grayscale slider, changes grayscale values
    graySlide.addEventListener('input',()=>{
        setPageGrayscale(graySlide.value);
    });

    //Event Listener that saves the user's Font & Color settings to be reloaded
    btnSave.addEventListener('click',async () => {
        chrome.storage.local.set({ colorObject: colorObj }).then(() => {
            console.log("Color is set");
        });

        chrome.storage.local.set({ fontObject: fontObj }).then(() => {
            console.log("Font is set");
        });

        txtOut.value = 'Changes Saved';
        txtOut.value += JSON.stringify(fontObj);
        txtOut.value += JSON.stringify(colorObj);

        chrome.action.setBadgeText({ text: 'Pass' });
    });

    //Event Listener that clears the locally stored data
    btnClear.addEventListener('click',()=>{
        chrome.storage.local.clear();
        txtOut.value = 'Changes Cleared';
    });

    //Event Listener that loads the locally stored data and applys it to the page
    btnLoad.addEventListener('click',()=>{
        txtOut.value = '';
        chrome.storage.local.get(["colorObject"]).then((result) => {
            setBackgroundColor(result.colorObject.background);
            setPageBrightness(result.colorObject.bright);
            setPageGrayscale(result.colorObject.grayscale);
        });

        chrome.storage.local.get(["fontObject"]).then((result) => {
            setFontSize(result.fontObject.size);
            setFontColor(result.fontObject.color);
            setFontName(result.fontObject.name);
            setFontId(result.fontObject.fontId);
        });

        txtOut.value = 'Preferences Loaded';
    });

    //Event Listener to increase local tab's font size
    btnIncrease.addEventListener('click',()=>{
        fontObj.size++
        setFontSize(fontObj.size);
        //changeFont('add');
    });
    
    //Event Listener to decrease local tab's font size
    btnDecrease.addEventListener('click',()=>{
        fontObj.size--;
        setFontSize(fontObj.size);
        //changeFont('minus');
    });

    //Function that changes the Global Browser font size
    function changeFont(operator){
        chrome.fontSettings.getDefaultFontSize({}, (fontInfo) => {
            let fontSize = fontInfo.pixelSize;

            if(operator === 'add'){fontSize += 2;
            } else { fontSize -= 2};

            chrome.fontSettings.setDefaultFontSize({ pixelSize: fontSize }, () => {
                fontSizeElement.textContent = newFontSize.toString();
            });
        });
    }

    //Event listener that shows the Font menu of options & Hides the Color options
    btnText.addEventListener('click',()=>{
        btnIncrease.style.display = "inline";
        btnDecrease.style.display = "inline";
        colorPick.style.display = "none";
        brightSelect.style.display = "none";
        graySlide.style.display = "none";
        fntSelect.style.display = "inline";
        lblFontSize.style.display = "inline";
    });

    //Event Listener that changes the font type 
    fntSelect.addEventListener('change',()=>{
        fontObj.fontId = fntSelect.value;
        switch(fontObj.fontId){
            //this font doesn't work yet
            case "atkinson":
                fontObj.fontName = `Atkinson Hyperlegible`;
                break;
            case "times":
                fontObj.fontName = `Times New Roman`;
                break;
            case "arial":
                fontObj.fontName = `Arial`;
                break;
            case "tahoma":
                fontObj.fontName = `Tahoma`;
                break;
            case "verdana":
                fontObj.fontName = `Verdana`;
                break;
            default:
                fontObj.fontName = `Times New Roman`;
        }
        fontCSS = `*{ font-family: '${fontObj.fontName}' !important; }`
        injectCSS(fontCSS);
        txtOut.value = fontObj.fontName;
    });

    //Event Listener for the color picker, sets picked color to CSS string and injects on tab
    colorPick.addEventListener('input',() =>{
        setBackgroundColor(colorPick.value);
    });

    //Event Listener for the Color Button that shows the Color Menu of options
    btnColor.addEventListener('click',()=>{
        btnIncrease.style.display = "none";
        btnDecrease.style.display = "none";
        colorPick.style.display = "inline";
        brightSelect.style.display = "inline";
        fntSelect.style.display = "none";
        lblFontSize.style.display = "none";

    });

    //Event Listener that scans the current page for missing alt text
    btnScan.addEventListener('click',()=>{
        //runFile('scripts/scan.js');
        runScript(scanForImage);
        //runScript();
        txtOut.value = `Number of Alt Text Missing: ${altObj.altNum} \nImage Sources: `

        txtOut.value += altObj.altSrc;  
        /*
        chrome.storage.local.get(["noAlt"]).then((result)=>{
            txtOut.value = JSON.stringify(result.noAlt);

            if(result.noAlt !== 0){
                chrome.action.setBadgeText({text : "Fail"});
            } else {
                chrome.action.setBadgeText({text: "Pass"});
            }
        });
        */


    });

    //function that injects the CSS passed into the function
    async function injectCSS(css) {
        try {
            await chrome.scripting.insertCSS({
                css: css,
                target: {
                    tabId: currTab
                }
            })
        } catch (e) {
            console.error(e);
            txtOut.value = 'Injection failed.';
        }

    }

    //Function that allows you to run a script on the page
    async function runScript(funct) {
            chrome.scripting
                .executeScript({
                    target : {tabId : currTab},
                    func : funct,
                    
                }).then(injectionResults => {
                    for (const {frameId, result} of injectionResults) {
                    //scriptResult = result;
                    console.log(result);
                    altObj.altNum = result.altNum;
                    altObj.altSrc = result.altSrc;
                    console.log(altObj);
                    }
                });
            
    }

    //Function that gets the current tab ID; ran each time you open the extension
    async function getTabId(){
        let queryOptions = {active: true, lastFocusedWindow: true};
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        let [tab] = await chrome.tabs.query(queryOptions);
        console.log(`tab`);
        currTab = await tab.id;
        console.log(`id`);
    }

    function runFile(fileName){
        chrome.scripting.executeScript({
            target: {tabId: currTab},
            files: [fileName]
        });
    }

/*
    function getTextInstances(){
        let textInstances = document.querySelectorAll("h1");
        textInstances.forEach(function(entry){
            console.log(entry.innerText);
        });
        txtOut.value = `${textInstances[0].innerText}`;
        textInstances[0].style.fontSize = `5px`;
    }

    function getButtonInstances(){
        let btnInstances = document.querySelectorAll("button");
        btnInstances.forEach(function(entry){
            txtOut.value += (entry.innerText) + ' ';
        });
    }
*/

    //Start of architecture change on applying changes
    function setBackgroundColor(background){
        colorObj.background = background;
        injectCSS(`body { background-color: ${background} !important; }`);
    }

    function setPageBrightness(bright){
        colorObj.bright = bright;
        injectCSS(`* {filter: brightness(${colorObj.bright}%) !important;}`);
    }

    function setPageGrayscale(grayscale){
        colorObj.grayscale = grayscale;
        injectCSS(`*{filter: grayscale(${colorObj.grayscale}%) !important;}`); 
    }

    function setFontSize(size){
        fontObj.size = size;
        injectCSS(`*{font-size: ${fontObj.size}px !important;}`);
    }

    function setFontColor(color){
        fontObj.color = color;
        //injectCSS(``);
    }

    function setFontName(name){
        fontObj.name = name;
        if(name !== ''){
            injectCSS(`*{ font-family: '${fontObj.fontName}' !important; }`);
        }
    }

    function setFontId(fontId){
        fontObj.fontId = fontId;
    }

});

function scanForImage(){
    const imageScan = document.querySelectorAll("img");

    console.log(imageScan);


    const altObj = {
        altNum: 0,
        altSrc: []
    }
    //For loop that adds and collects the images with no alt text
    for (let i = 0; i < imageScan.length; i++){
        if(imageScan[i].alt === ""){
            altObj.altNum += 1;
            //altText[i] = imageScan[i].alt;
            altObj.altSrc[i] = imageScan[i].currentSrc;
        }
    }
    console.log(altObj);

    return altObj;
    /*
    chrome.storage.local.set({noAlt: countNoAlt}).then(()=>{
        console.log(`Lack of Alt Text value is set at ${countNoAlt}`);
    });
    */
}
/**
 *      ToDo:
 *     + Objects Save & Load & Apply 
 *     - Alt Text Object on Scan
 *     - Scan only scanning inside main
 *     - AI Alt Text using crowdsourced Stable Horde
 *     - Scan passing [checkmark] or failing [x] for alt text (badge notification)
 *     - Actual Disability Problems/Solutions [colorblind etc]
 *     - Downloaded fonts for better readability
 *     - Usability stuff like button outline etc.
 *     - Potentially have getTabId() return tabId
 */