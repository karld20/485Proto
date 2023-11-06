document.addEventListener('DOMContentLoaded', function() {
    const btnColor = document.getElementById('btnColor');
    const btnText = document.getElementById('btnText');
    const btnAI = document.getElementById('btnAI');
    const btnSubmit = document.getElementById("btnSubmit");
    const colorPick = document.getElementById("colorpicker");
    const fntSelect = document.getElementById("fonts");
    let picked = "";
    let backgroundCSS = ``;
    let fontCSS = "";
    let fontID = "";
    let fontName = "";


    //Event listener that changes the font on the page based on what's selected on dropdown
    btnText.addEventListener('click',()=>{
        fontID = fntSelect.value;
        btnAI.innerText = `${fontID}`;
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
    });

    //Event Listener for the Color Button that injects the chosen background CSS
    btnColor.addEventListener('click',()=>{
        injectCSS(backgroundCSS);
    });

    //currently unused event handler
    btnAI.addEventListener('click',()=>{

    });

    //function that gets the current tab you're on then injects the CSS passed in the function
    async function injectCSS(css) {
        let queryOptions = {active: true, lastFocusedWindow: true};
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        let [tab] = await chrome.tabs.query(queryOptions);
        try {
            await chrome.scripting.insertCSS({
                css: css,
                target: {
                    tabId: tab.id
                }
            }).then(() => console.log(picked));
        } catch (e) {
            console.error(e);
            btnAI.innerText = 'Injection failed.';
        }

        console.log(`${css}`);

    }

    //unused function for if I was able to split up getting the tab & injectcss tasks
    function getTabId(){
        let queryOptions = { active: true, lastFocusedWindow: true };
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        let [tab] = chrome.tabs.query(queryOptions);
        return tab[0];
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