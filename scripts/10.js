document.addEventListener("DOMContentLoaded", function(){

const FEED_URL="https://io.adafruit.com/api/v2/CyCPollutionMonitor/feeds/cycnantgarw10/data"

let jsonData=[]
let timestampSet=new Set()
let newestTimestamp=null
let pollutionChart=null

let currentPage=1
const perPage=12

const dateInput=document.getElementById("dateFilter")
const rangeSelect=document.getElementById("rangeSelect")

const today=new Date().toISOString().split("T")[0]
dateInput.max=today

/* ---------- URL PARAM SUPPORT ---------- */

function getQueryParams(){
    const params = new URLSearchParams(window.location.search)
    return {
        date: params.get("date"),
        range: params.get("range")
    }
}

function updateURL(){
    const params = new URLSearchParams()
    params.set("date", dateInput.value)
    params.set("range", rangeSelect.value)
    window.history.replaceState({}, "", "?" + params.toString())
}

const query = getQueryParams()

// Default to today, then override if URL has a date
dateInput.value = query.date ? query.date : today

// Apply range if provided
if(query.range){
    rangeSelect.value = query.range
}

/* ---------- CACHE ---------- */

function loadCache(){

const cached=localStorage.getItem("pollutionCache")

if(cached){

jsonData=JSON.parse(cached)

jsonData.forEach(e=>timestampSet.add(e.created_at))

newestTimestamp=Math.max(...jsonData.map(x=>new Date(x.created_at)))

applyFilter()

}

}

function saveCache(){

try{
localStorage.setItem("pollutionCache",JSON.stringify(jsonData))
}catch(e){}

}

/* ---------- SAFE ADD (NO DUPLICATES) ---------- */

function addEntries(entries){

let added=false

entries.forEach(e=>{

if(!timestampSet.has(e.created_at)){

jsonData.push(e)
timestampSet.add(e.created_at)
added=true

}

})

if(added){

newestTimestamp=Math.max(...jsonData.map(x=>new Date(x.created_at)))

}

}

/* ---------- INITIAL LOAD ---------- */

async function loadInitialData(){

try{

const r=await fetch(`${FEED_URL}?limit=100`)
const data=await r.json()

addEntries(data)

saveCache()

applyFilter()

loadHistoryBackground()

}catch(err){

console.error("Initial load failed",err)

}

}

/* ---------- BACKGROUND HISTORY ---------- */

async function loadHistoryBackground(){

let page=2
const limit=1000

while(true){

try{

const r=await fetch(`${FEED_URL}?limit=${limit}&page=${page}`)
const data=await r.json()

if(data.length===0) break

addEntries(data)

if(page%3===0){

saveCache()
applyFilter()

}

if(data.length<limit) break

page++

}catch(err){

console.error("Background load stopped",err)
break

}

}

saveCache()
applyFilter()

}

/* ---------- REALTIME ---------- */

async function fetchLatest(){

try{

const r=await fetch(`${FEED_URL}?limit=50`)
const data=await r.json()

addEntries(data)

saveCache()

applyFilter()

}catch(err){

console.error("Live update failed",err)

}

}

/* ---------- FILTER ---------- */

function applyFilter(){

const selectedDate=dateInput.value
const sortType=document.querySelector('input[name="sortOrder"]:checked').value
const range=rangeSelect.value

let filtered=jsonData.filter(item=>{

const d=new Date(item.created_at)

if(range==="day"){
return d.toISOString().split("T")[0]===selectedDate
}

if(range==="week"){
const start=new Date(selectedDate)
start.setDate(start.getDate()-7)
return d>=start
}

if(range==="month"){
const start=new Date(selectedDate)
start.setMonth(start.getMonth()-1)
return d>=start
}

})

/* remove any duplicates that slipped through */

const seen=new Set()

filtered=filtered.filter(x=>{
if(seen.has(x.created_at)) return false
seen.add(x.created_at)
return true
})

filtered.sort((a,b)=>{

const da=new Date(a.created_at)
const db=new Date(b.created_at)

return sortType==="asc"?da-db:db-da

})

updateStats(filtered)
displayChart(filtered)
displayTable(filtered)

}

/* ---------- STATS ---------- */

function updateStats(list){

if(list.length===0) return

const values=list.map(x=>Number(x.value))

const avg=(values.reduce((a,b)=>a+b,0)/values.length).toFixed(2)
const min=Math.min(...values)
const max=Math.max(...values)

const latest=list[0].value

document.getElementById("avgValue").innerText=avg
document.getElementById("minValue").innerText=min
document.getElementById("maxValue").innerText=max
document.getElementById("latestValue").innerText=latest

}

/* ---------- MOVING AVERAGE ---------- */

function movingAverage(arr,window=5){

let result=[]

for(let i=0;i<arr.length;i++){

let start=Math.max(0,i-window)
let subset=arr.slice(start,i+1)

result.push(subset.reduce((a,b)=>a+b,0)/subset.length)

}

return result

}

/* ---------- CHART ---------- */

function displayChart(list){

if(list.length===0) return

const sorted=[...list].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at))

const times=sorted.map(x=>new Date(x.created_at))
const values=sorted.map(x=>Number(x.value))

const hours=times.map(t=>t.getHours()+t.getMinutes()/60)

const minHour=Math.floor(Math.min(...hours))
const maxHour=Math.ceil(Math.max(...hours))

const avg=movingAverage(values)

const points=hours.map((h,i)=>({x:h,y:values[i]}))
const avgPoints=hours.map((h,i)=>({x:h,y:avg[i]}))

const ctx=document.getElementById("pollutionChart")

if(!pollutionChart){

pollutionChart=new Chart(ctx,{

type:"line",

data:{
datasets:[
{label:"Pollution",data:points,borderWidth:2,tension:0.3},
{label:"Moving Avg",data:avgPoints,borderColor:"blue",pointRadius:0}
]
},

options:{
animation:false,
responsive:true,
scales:{
x:{
type:"linear",
min:minHour,
max:maxHour,
ticks:{
stepSize:1,
callback:v=>String(v).padStart(2,"0")+":00"
}
},
y:{beginAtZero:true}
}
}

})

}else{

pollutionChart.data.datasets[0].data=points
pollutionChart.data.datasets[1].data=avgPoints

pollutionChart.options.scales.x.min=minHour
pollutionChart.options.scales.x.max=maxHour

pollutionChart.update()

}

}

/* ---------- TABLE ---------- */

function displayTable(list){

const totalPages=Math.ceil(list.length/perPage)

if(currentPage>totalPages) currentPage=1

const start=(currentPage-1)*perPage
const page=list.slice(start,start+perPage)

let html=`<table class="table table-striped"><thead><tr><th>Time</th><th>Value</th></tr></thead><tbody>`

page.forEach(e=>{

const time=new Date(e.created_at).toLocaleTimeString()

html+=`<tr><td>${time}</td><td>${e.value}</td></tr>`

})

html+="</tbody></table>"

html+=`<nav><ul class="pagination justify-content-center">`

for(let i=1;i<=totalPages;i++){

html+=`<li class="page-item ${i===currentPage?"active":""}">
<button class="page-link" data-page="${i}">${i}</button>
</li>`

}

html+=`</ul></nav>`

document.getElementById("data").innerHTML=html

document.querySelectorAll(".page-link").forEach(b=>{

b.onclick=()=>{
currentPage=Number(b.dataset.page)
displayTable(list)
}

})

}

/* ---------- DARK MODE ---------- */

document.getElementById("darkToggle").onclick=()=>{
document.body.classList.toggle("dark")
}

/* ---------- EVENTS ---------- */

dateInput.onchange=()=>{
updateURL()
applyFilter()
}

rangeSelect.onchange=()=>{
updateURL()
applyFilter()
}

document.querySelectorAll('input[name="sortOrder"]').forEach(r=>{
r.onchange=applyFilter
})

/* ---------- START ---------- */

loadCache()
loadInitialData()

setInterval(fetchLatest,5000)

})