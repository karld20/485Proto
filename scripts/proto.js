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
    const graySlide = document.getElementById('graySlide')

    let currTab;
    let tempCSS = "";
    let picked = "";
    let backgroundCSS = ``;
    let fontCSS = "";

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

    //Runs every time you click the extension button to get the current tab id
    getTabId();

    //Event Listener for the slider, changes brightness values
    brightSelect.addEventListener('input',()=>{
        colorObj.bright = brightSelect.value;
        brightCSS = `* {filter: brightness(${brightValue}%) !important;}`;
        injectCSS(brightCSS);
    });

    //Event listener for the grayscale slider, changes grayscale values
    graySlide.addEventListener('input',()=>{
        colorObj.grayscale = graySlide.value;
        tempCSS = `*{filter: grayscale(${colorObj.grayscale}%) !important;}`;
        injectCSS(tempCSS);
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
    });

    //Event Listener that clears the locally stored data
    btnClear.addEventListener('click',()=>{
        chrome.storage.local.clear();
        txtOut.value = 'Changes Cleared';
    });

    //Event Listener that loads the locally stored data and applys it to the page
    btnLoad.addEventListener('click',()=>{
        txtOut.value = '';
        chrome.storage.local.get(["colorKey"]).then((result) => {
            console.log("Value currently is " + result.colorKey);
            txtOut.value += 'Color: ' + result.colorKey + ' ';
            backgroundCSS = `body { background-color: ${result.colorKey} !important; }`;
            injectCSS(backgroundCSS);
        });
        chrome.storage.local.get(["fontKey"]).then((result) => {
            console.log("Value currently is " + result.fontKey);
            txtOut.value += 'Font: ' + result.fontKey + ' ';
            fontCSS = `body{ font-family: '${result.fontKey}' !important; }`
            injectCSS(fontCSS);
        });

    });

    //Event Listener to increase local tab's font size
    btnIncrease.addEventListener('click',()=>{
        fontObj.size++
        injectCSS(`*{font-size: ${fontObj.size}px !important;}`);
        //changeFont('add');
    });
    
    //Event Listener to decrease local tab's font size
    btnDecrease.addEventListener('click',()=>{
        fontObj.size--;
        injectCSS(`*{font-size: ${fontObj.size}px !important;}`);
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

    //Event listener that shows the Font menu of options
    btnText.addEventListener('click',()=>{
        btnIncrease.style.display = "inline";
        btnDecrease.style.display = "inline";
        colorPick.style.display = "none";
        brightSelect.style.display = "none";
        fntSelect.style.display = "inline";
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
        fontCSS = `body{ font-family: '${fontObj.fontName}' !important; }`
        injectCSS(fontCSS);
        txtOut.value = fontObj.fontName;
    });

    //Event Listener for the color picker, sets picked color to CSS string and injects on tab
    colorPick.addEventListener('input',() =>{
        colorObj.background = colorPick.value;
        backgroundCSS = `body { background-color: ${colorObj.background} !important; }`;
        injectCSS(backgroundCSS);
        txtOut.value = picked;
        txtOut.value += " " + colorObj.background;
    });

    //Event Listener for the Color Button that shows the Color Menu of options
    btnColor.addEventListener('click',()=>{
        btnIncrease.style.display = "none";
        btnDecrease.style.display = "none";
        colorPick.style.display = "inline";
        brightSelect.style.display = "inline";
        fntSelect.style.display = "none";

    });

    //Event Listener that scans the current page for missing alt text
    btnScan.addEventListener('click',()=>{
        runFile('scripts/scan.js');

        chrome.storage.local.get(["noAlt"]).then((result)=>{
            console.log(result.noAlt);
        });

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
            })
            .then(() => console.log ("injected a function"));
    }

    //Function that gets the current tab ID; ran each time you open the extension
    async function getTabId(){
        let queryOptions = {active: true, lastFocusedWindow: true};
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        let [tab] = await chrome.tabs.query(queryOptions);
        currTab = tab.id;
        txtOut.value = currTab;

        console.log('ranFunct');
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
    function setBackgroundColor(backColor){
        injectCSS(`body { background-color: ${backColor} !important; }`);
    }

});

/**
 *      ToDo:
 *     - Objects Save & Load & Apply
 *     - Alt Text Object on Scan
 *     - Scan only scanning inside body
 *     - AI Alt Text using crowdsourced Stable Horde
 *     - Scan passing [checkmark] or failing [x] for alt text (badge notification)
 *     - Actual Disability Problems/Solutions [colorblind etc]
 *     - Downloaded fonts for better readability
 *
 */