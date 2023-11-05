document.addEventListener('DOMContentLoaded', function() {
    const btnColor = document.getElementById('btnColor');
    const btnText = document.getElementById('btnText');
    const btnAI = document.getElementById('btnAI');
    const btnSubmit = document.getElementById("btnSubmit");
    const colorPick = document.getElementById("colorpicker");
    let picked = "";
    let css = ``;

    colorPick.addEventListener('input',() =>{
        picked = document.getElementById("colorpicker").value;
        css = `body { background-color: ${picked}; }`;
    });

    btnColor.addEventListener('click',()=>{
        injectCSS();
    });

    btnAI.addEventListener('click',()=>{

    });

    async function injectCSS() {
        let queryOptions = {active: true, lastFocusedWindow: true};
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        let [tab] = await chrome.tabs.query(queryOptions);
        try {
            await chrome.scripting.insertCSS({
                css: css,
                target: {
                    tabId: tab.id
                }
            }).then(() => btnAI.innerText = `${picked}`);
        } catch (e) {
            console.error(e);
            btnAI.innerText = 'Injection failed.';
        }

        console.log(`${css}`);

    }


    function getTabId(){
        let queryOptions = { active: true, lastFocusedWindow: true };
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        let [tab] = chrome.tabs.query(queryOptions);
        return tab[0];
    }




});