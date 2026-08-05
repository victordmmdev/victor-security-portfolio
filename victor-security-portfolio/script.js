/* =====================================
   VICTOR MAGALDI
   CYBERSECURITY PORTFOLIO
   SCRIPT.JS
===================================== */



/* ==========================
   MATRIX BACKGROUND
========================== */


const canvas = document.getElementById("matrix");

const ctx = canvas.getContext("2d");


canvas.height = window.innerHeight;
canvas.width = window.innerWidth;


const letters = 
"010101010101ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&";


const fontSize = 14;


const columns = canvas.width / fontSize;


const drops = [];


for(let i = 0; i < columns; i++){

drops[i] = 1;

}



function drawMatrix(){


ctx.fillStyle = "rgba(0,0,0,0.05)";

ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);


ctx.fillStyle="#00ff88";


ctx.font =
fontSize+"px monospace";



for(let i=0;i<drops.length;i++){


const text =
letters[
Math.floor(
Math.random()*letters.length
)
];



ctx.fillText(
text,
i*fontSize,
drops[i]*fontSize
);



if(
drops[i]*fontSize >
canvas.height &&
Math.random()>0.975
){

drops[i]=0;

}



drops[i]++;


}


}


setInterval(
drawMatrix,
50
);





window.addEventListener(
"resize",
()=>{

canvas.width =
window.innerWidth;


canvas.height =
window.innerHeight;


}
);








/* ==========================
   TERMINAL ANIMATION
========================== */


const terminalLines=[


"[+] Initializing security framework...",


"[+] Loading threat intelligence modules...",


"[+] Connecting to vulnerability database...",


"[+] Starting network analysis...",


"[+] Running CVE assessment...",


"[+] Checking exposed services...",


"[+] Scanning ports...",


"[+] Detecting suspicious activity...",


"[+] Security monitoring active ✓"


];



let terminalIndex=0;



function writeTerminal(){


const terminal =
document.getElementById(
"terminalText"
);



if(
terminalIndex <
terminalLines.length
){



let line =
document.createElement(
"div"
);


line.innerHTML =
terminalLines[terminalIndex];



terminal.appendChild(
line
);



terminalIndex++;


setTimeout(
writeTerminal,
900
);


}



}


writeTerminal();








/* ==========================
   ATTACK GRAPH
========================== */



const chart =
document.getElementById(
"attackChart"
);



if(chart){



const attackChart =
new Chart(
chart,
{


type:"line",



data:{



labels:[

"00h",
"04h",
"08h",
"12h",
"16h",
"20h"

],



datasets:[{


label:
"Threat Detection",


data:[

15,
30,
20,
65,
40,
90

],



borderWidth:3,



tension:.4



}]


},



options:{



responsive:true,


plugins:{


legend:{


labels:{


color:"#00ff88"


}


}


}



}


}

);






/* Atualização simulada */


setInterval(()=>{


attackChart.data.datasets[0]
.data.push(

Math.floor(
Math.random()*100
)

);



attackChart.data.labels.push(
new Date()
.getHours()
+":00"
);



if(
attackChart.data.labels.length>10
){


attackChart.data.labels.shift();


attackChart.data.datasets[0]
.data.shift();


}



attackChart.update();


},3000);



}








/* ==========================
   THREAT COUNTER
========================== */


let threats = 128;



const threatElement =
document.getElementById(
"threats"
);



if(threatElement){



setInterval(()=>{


threats +=
Math.floor(
Math.random()*3
);



threatElement.innerHTML =
threats;



},4000);



}








/* ==========================
   SECURITY SCANNER SIMULADO
========================== */



const scans=[


"Scanning ports 80,443...",


"Analyzing HTTP headers...",


"Checking SQL Injection vectors...",


"Testing XSS payloads...",


"Analyzing authentication...",


"Checking CVE database...",


"System protected ✓"



];



let scan=0;



setInterval(()=>{


console.log(
"[SECURITY SCAN] "+
scans[scan]
);



scan++;


if(
scan>=scans.length
){

scan=0;

}


},2000);








/* ==========================
   CURSOR TERMINAL
========================== */


const cursor =
document.createElement(
"span"
);


cursor.innerHTML="_";


cursor.style.animation =
"blink 1s infinite";



document
.getElementById(
"terminalText"
)
.appendChild(
cursor
);