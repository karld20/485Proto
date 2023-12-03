document.addEventListener('DOMContentLoaded', function() {
    const btnColor = document.getElementById('btnColor');
    const btnText = document.getElementById('btnText');
    const colorPick = document.getElementById("colorpicker");
    const fntSelect = document.getElementById("fonts");
    const btnDecrease = document.getElementById("btnDecrease");
    const btnIncrease = document.getElementById("btnIncrease");
    let picked = "";
    let backgroundCSS = ``;
    let fontCSS = "";
    //let fontID = "";
    let fontName = "";
    const btnSave = document.getElementById('btnSave');
    const btnLoad = document.getElementById('btnLoad');
    const txtOut = document.getElementById('txtOut');
    const btnClear = document.getElementById('btnClear');
    const btnScan = document.getElementById('btnScan');
    const graySlide = document.getElementById('graySlide')
    let currTab;
    let tempCSS = "";
    let bright = "";

    let select = "";

    const brightSelect = document.getElementById('myRange');


    let count = 1;

    const fontObj = {
        size: 16,
        color: "",  //haven't finished this yet
        name: "",
        fontId: "",
    }

    const colorObj = {
        bright: 100,
        background: "",
        grayscale: 0,
        colorId: "",
    }

    getTabId();

    brightSelect.addEventListener('input',()=>{
        colorObj.bright = brightSelect.value;
        brightCSS = `* {filter: brightness(${brightValue}%) !important;}`;
        injectCSS(brightCSS);
    });

    graySlide.addEventListener('input',()=>{
        colorObj.grayscale = graySlide.value;
        tempCSS = `*{filter: grayscale(${colorObj.grayscale}%) !important;}`;
        injectCSS(tempCSS);
    });



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

    btnClear.addEventListener('click',()=>{
        chrome.storage.local.clear();
        txtOut.value = 'Changes Cleared';
        injectCSS(`*{filter: grayscale(200%) !important;}`);
    });

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

    btnIncrease.addEventListener('click',()=>{
        fontObj.size++
        injectCSS(`*{font-size: ${fontObj.size}px !important;}`);
        //changeFont('add');
    });

    btnDecrease.addEventListener('click',()=>{
        fontObj.size--;
        injectCSS(`*{font-size: ${fontObj.size}px !important;}`);
        //changeFont('minus');
    });

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

    //Event listener that changes the font on the page based on what's selected on dropdown
    btnText.addEventListener('click',()=>{
        btnIncrease.style.display = "inline";
        btnDecrease.style.display = "inline";
        colorPick.style.display = "none";
        brightSelect.style.display = "none";
        fntSelect.style.display = "inline";
    });

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

    //Event Listener for the color picker, sets picked color to CSS string
    colorPick.addEventListener('input',() =>{
        colorObj.background = colorPick.value;
        backgroundCSS = `body { background-color: ${colorObj.background} !important; }`;
        injectCSS(backgroundCSS);
        txtOut.value = picked;
        txtOut.value += " " + colorObj.background;
    });

    //Event Listener for the Color Button that injects the chosen background CSS
    btnColor.addEventListener('click',()=>{
        btnIncrease.style.display = "none";
        btnDecrease.style.display = "none";
        colorPick.style.display = "inline";
        brightSelect.style.display = "inline";
        fntSelect.style.display = "none";

        //injectCSS(backgroundCSS);
        /*
       counter += 1;

       if(counter % 2 === 0){

        injectCSS(`body { background-color: ${green} !important;}`);
        } else {
            injectCSS(`body { background-color: ${blue} !important;}`);
        }
        */

    });

    //currently unused event handler
    btnScan.addEventListener('click',()=>{
        runFile('scripts/scan.js');

        chrome.storage.local.get(["noAlt"]).then((result)=>{
            console.log(result.noAlt);
        });

        //runScript(getButtonInstances());
        /*
        let options = {
            type: 'basic',
            title: 'Scan Notification',
            message: 'Scanned Page',
            iconUrl: 'images/UI_Logo.png'
        };
        chrome.notifications.create(options);

         */
    });

    //function that gets the current tab you're on then injects the CSS passed in the function
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


    async function runScript(funct) {
        chrome.scripting
            .executeScript({
                target : {tabId : currTab},
                func : funct,
            })
            .then(() => console.log ("injected a function"));
    }

    //unused function for if I was able to split up getting the tab & injectcss tasks
    async function getTabId(){
        let queryOptions = {active: true, lastFocusedWindow: true};
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        let [tab] = await chrome.tabs.query(queryOptions);
        currTab = tab.id;
        txtOut.value = currTab;

        console.log('ranFunct');
    }

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


    //Might want to break this up soon
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