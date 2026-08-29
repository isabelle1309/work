const tallyEl = document.getElementById("countBtn");
tallyEl.addEventListener("click",()=>{
    var count = parseInt(tallyEl.innerText) + 1;
    tallyEl.innerText = `${count}`;
})

const resetEl = document.getElementById("resetBtn");
resetEl.addEventListener("click",()=>{
    tallyEl.innerText = `0`;
})