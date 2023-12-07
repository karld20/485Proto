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
    const btnAI = document.getElementById('btnAI');
    const brightSelect = document.getElementById('myRange');
    const fontMenu = document.getElementById('fontMenu');
    const colorMenu = document.getElementById('colorMenu');
    const chkReport = document.getElementById('chkReport');
    const themesSelect = document.getElementById('themes');
    const fontPick = document.getElementById('fontpicker');
    
    let fcCheck = false;

    let url = "";

    let currTab;
    let fontCSS = "";
    let textOutput = "";
    let passFail = "";


    //Font Object to save settings
    const fontObj = {
        size: 18,
        color: "",
        name: "",
        fontId: "",
    }

    //Color Object to save settings
    const colorObj = {
        bright: 100,
        background: "",
        grayscale: 0,
        colorId: "",
        fullcolor: ""
    }

    //Alt Text Object from Scan
    const altObj = {
        altNum: 0,
        altSrc: [],
        pageTitle: ""
    }

    fontMenu.style.display = "none";
    colorMenu.style.display = "none";
    //Runs every time you click the extension button to get the current tab id
    getTabId();

    //Clears badge text when clicking the icon
    chrome.action.setBadgeText({ text: '' });

    

    //Opens html page for extension information when clicked
    btnInfo.addEventListener('click',()=>{
        chrome.tabs.create({
            url: "html/info.html"
          });
    });

    //Event Listener for the slider, changes brightness values
    brightSelect.addEventListener('input',()=>{
        if(colorObj.grayscale !== 0){
            colorObj.bright = brightSelect.value;
            txtOut.value = `Brightness= ${colorObj.bright} Grayscale = ${colorObj.grayscale}`;
            injectCSS(`*{filter: brightness(${colorObj.bright}%) grayscale(${colorObj.grayscale}%) !important;}`);
        }else{
            setPageBrightness(brightSelect.value);
        }
    });

    //Event listener for the grayscale slider, changes grayscale values
    graySlide.addEventListener('input',()=>{
        if(colorObj.bright !== 100){
            colorObj.grayscale = graySlide.value;
            txtOut.value = `Brightness= ${colorObj.bright} Grayscale = ${colorObj.grayscale}`;
            injectCSS(`*{filter: brightness(${colorObj.bright}%) grayscale(${colorObj.grayscale}%) !important;}`);
        }else{
            setPageGrayscale(graySlide.value);
        }
    });

    //Event Listener that saves the user's Font & Color settings to be reloaded
    btnSave.addEventListener('click',async () => {
        chrome.storage.local.set({ colorObject: colorObj }).then(() => {
            console.log("Color is set");
        });

        chrome.storage.local.set({ fontObject: fontObj }).then(() => {
            console.log("Font is set");
        });

        txtOut.value = 'Changes Saved\n\n';
        /*
        txtOut.value += JSON.stringify(fontObj);
        txtOut.value += JSON.stringify(colorObj);
        */

        chrome.action.setBadgeText({ text: 'Save' });
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
            setFullColor(result.colorObject.fullcolor);
            setPageBrightness(result.colorObject.bright);
            setPageGrayscale(result.colorObject.grayscale);
            setPageFilters(result.colorObject.bright, result.colorObject.grayscale);
        });

        chrome.storage.local.get(["fontObject"]).then((result) => {
            setFontSize(result.fontObject.size);
            setFontColor(result.fontObject.color);
            setFontName(result.fontObject.name);
            setFontId(result.fontObject.fontId);
        });

        txtOut.value = 'Preferences Loaded';
        /*
        txtOut.value += JSON.stringify(fontObj);
        txtOut.value += JSON.stringify(colorObj);
        */
        chrome.action.setBadgeText({ text: 'Load' });

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
        fontMenu.style.display = "initial";
        colorMenu.style.display = "none";
    });

    themesSelect.addEventListener('change',()=>{
        fcCheck = true;
        switch(themesSelect.value){
            case "whiteandblack":
                setFullColor("#ffffff");
                setFontColor("#000000");
                break;
            case "blackandwhite":
                setFullColor("#000000");
                setFontColor("#ffffff");
                break;
            case "grayandwhite":
                setFullColor("#808080");
                setFontColor("#ffffff");
                break;
            case "grayandgreen":
                setFullColor("#808080");
                setFontColor("#22e508");
                break;
        }
        txtOut.value = "Theme Changed";
    });

    //Event Listener that changes the font type 
    fntSelect.addEventListener('change',()=>{
        fontObj.fontId = fntSelect.value;
        switch(fontObj.fontId){
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
        txtOut.value = `Font changed to ${fontObj.fontName}`;
    });

    //Event Listener for the color picker, sets picked color to CSS string and injects on tab
    colorPick.addEventListener('input',() =>{
        setBackgroundColor(colorPick.value);
    });

    fontPick.addEventListener('input',()=>{
        setFontColor(fontPick.value);
    });

    //Event Listener for the Color Button that shows the Color Menu of options
    btnColor.addEventListener('click',()=>{
        fontMenu.style.display = "none";
        colorMenu.style.display = "initial";

    });

    //Event Listener that scans the current page for missing alt text
    btnScan.addEventListener('click',()=>{
        runScript(scanForImage, "AltText");
        //runScript(scanForSubtitles,"Subtitles");
        
    });

    btnAI.addEventListener('click',()=>{
        txtOut.value = "Stay Tuned!";
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
    async function runScript(funct, identifier) {
            chrome.scripting
                .executeScript({
                    target : {tabId : currTab},
                    func : funct,
                    
                }).then(injectionResults => {
                    for (const {frameId, result} of injectionResults) {
                        if(identifier === "AltText"){
                            processAltText(result);
                        } 
                        else if(identifier === "Subtitles"){

                        }
                    }
                });
            
    }



    //Function that gets the current tab ID; ran each time you open the extension
    async function getTabId(){
        let queryOptions = {active: true, lastFocusedWindow: true};
        let [tab] = await chrome.tabs.query(queryOptions);
        console.log(`tab`);
        currTab = await tab.id;
        console.log(`id`);
        url = tab.url;
    }

    function runFile(fileName){
        chrome.scripting.executeScript({
            target: {tabId: currTab},
            files: [fileName]
        });
    }

    //Setting values & updating CSS
    function setBackgroundColor(background){
        
        if(fcCheck === true){
            colorObj.fullcolor = background;
            injectCSS(`* { background-color: ${background} !important; }`);
        }else{
            colorObj.background = background;
            injectCSS(`body { background-color: ${background} !important; }`);
        }

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
        injectCSS(`*{color: ${fontObj.color} !important;}`);
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

    function setPageFilters(bright, grayscale){
        colorObj.bright = bright;
        colorObj.grayscale = grayscale;

        injectCSS(`*{filter: brightness(${colorObj.bright}%) grayscale(${colorObj.grayscale}%) !important;}`);
    }

    function setFullColor(fullcolor){
        colorObj.fullcolor = fullcolor;
        injectCSS(`*{background-color: ${colorObj.fullcolor} !important;}`);
    }

    function processAltText(result){
        altObj.pageTitle = result.pageTitle;
        altObj.altNum = result.altNum;
        altObj.altSrc = result.altSrc;

        if(result.altNum !== 0){
            chrome.action.setBadgeText({text : "Fail"});
            passFail = "Fail";
        } else {
            chrome.action.setBadgeText({text: "Pass"});
            passFail = "Pass";
        }

        txtOut.value = `Scan Result: ${passFail} \nURL: ${url} \nTitle: ${altObj.pageTitle} \nNumber of Alt Text Missing: ${altObj.altNum} \nImage Sources:\n`;
        for (let i = 0; i < altObj.altSrc.length; i++){
                txtOut.value += i+1 + ". " + altObj.altSrc[i] + "\n";
        }
        
        textOutput = txtOut.value;
        if(chkReport.checked == true){
            const link = document.createElement("a");
            const file = new Blob([textOutput], { type: 'text/plain' });
            link.href = URL.createObjectURL(file);
            link.download = `alttext_scan_report_${url}.txt`;
            link.click();
            URL.revokeObjectURL(link.href);
        }
    }

});

function scanForImage(){
    const imageScan = document.querySelectorAll("img");

    console.log(imageScan);

    //Alt text object to keep track of number of alt text missing as well as source of image
    const altObj = {
        altNum: 0,
        altSrc: [],
        pageTitle: ""
    }

    const titleScan = document.querySelectorAll("title");

    altObj.pageTitle = titleScan[0].innerHTML;

    let j = 0;
    //For loop that adds and collects the images with no alt text
    for (let i = 0; i < imageScan.length; i++){
        if(imageScan[i].alt === "" && imageScan[i].ariaHidden !== "true" && imageScan[i].display !== "none" && 
        imageScan[i].naturalWidth !== 1 && imageScan[i].currentSrc !== "" && imageScan[i].naturalWidth !== 0 && imageScan[i].height !== 1){
            altObj.altNum += 1;
            //altText[i] = imageScan[i].alt;
            altObj.altSrc[j] = imageScan[i].currentSrc;
            j++
        }
    }
    console.log(altObj);

    return altObj;

}

function scanForSubtitles(){
    const subScan = document.querySelectorAll("video");
    console.log(subScan);
}
/**
 *      ToDo:
 *     - Bug Fixing [Font size mostly]
 *     - Disability Problems/Solutions [color & text themes] [if time]
 *     - Save Themes
 *     - Extension CSS
 * 
 *     - Usability stuff like button outline etc. [Unlikely]
 *     - Downloaded fonts for better readability [Unlikely]
 *     - AI Alt Text using crowdsourced Stable Horde [Unfeasable]
 */