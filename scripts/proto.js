document.addEventListener('DOMContentLoaded', function() {
    const btnColor = document.getElementById('btnColor');
    const btnText = document.getElementById('btnText');
    const btnAI = document.getElementById('btnAI');
    const btnSubmit = document.getElementById("btnSubmit");
    const colorPick = document.getElementById("colorpicker");
    const fntSelect = document.getElementById("fonts");
    const btnDecrease = document.getElementById("btnDecrease");
    const btnIncrease = document.getElementById("btnIncrease");
    let picked = "";
    let backgroundCSS = ``;
    let fontCSS = "";
    let fontID = "";
    let fontName = "";
    const btnSave = document.getElementById('btnSave');
    const btnLoad = document.getElementById('btnLoad');
    const txtOut = document.getElementById('txtOut');
    const btnClear = document.getElementById('btnClear');
    const btnScan = document.getElementById('btnScan');
    let currTab;

    getTabId();


    btnSave.addEventListener('click',async () => {
        chrome.storage.local.set({ colorKey: picked }).then(() => {
            console.log("Value is set");
        });

        chrome.storage.local.set({ fontKey: fontID }).then(() => {
            console.log("Value is set");
        });

        txtOut.value = 'Changes Saved';
    });

    btnClear.addEventListener('click',()=>{
        chrome.storage.local.clear();
        txtOut.value = 'Changes Cleared';
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
        changeFont('add');
    });

    btnDecrease.addEventListener('click',()=>{
        changeFont('minus');
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
        fontID = fntSelect.value;

        txtOut.value = `${fontID}`;
        switch(fontID){
            //this font doesn't work yet
            case "atkinson":
                fontName = `Atkinson Hyperlegible`;
                break;
            case "times":
                fontName = `Times New Roman`;
                break;
            case "arial":
                fontName = `Arial`;
                break;
            case "tahoma":
                fontName = `Tahoma`;
                break;
            case "verdana":
                fontName = `Verdana`;
                break;
        }
        fontCSS = `body{ font-family: '${fontName}' !important; }`
        injectCSS(fontCSS);
    })

    //Event Listener for the color picker, sets picked color to CSS string
    colorPick.addEventListener('input',() =>{
        picked = document.getElementById("colorpicker").value;
        backgroundCSS = `body { background-color: ${picked} !important; }`;

        txtOut.value = picked;
    });

    //Event Listener for the Color Button that injects the chosen background CSS
    btnColor.addEventListener('click',()=>{
        if(picked === ""){
            injectCSS(`body { background-color: #808080 !important; }`)
        }else{ injectCSS(backgroundCSS);}

    });

    //currently unused event handler
    btnScan.addEventListener('click',()=>{
        runScript(getButtonInstances());
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
            }).then(() => console.log(currTab));
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
    function setFont(){

    }

});

/**
 *      ToDo:
 *     - Having it only grab tabID if you're on a new page to save time/remove async errors
 *     - Text Size function
 *     - Sliders to dictate greyscale or brightness or color intensity
 *     - AI Alt Text using crowdsourced Stable Horde
 *     - More robust CSS file injections
 *     - Scanning of page
 *     -
 *
 */