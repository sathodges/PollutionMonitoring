let jsonData=[]
let chart

const dateInput=document.getElementById("datePicker")
const rangeSelect=document.getElementById("rangeSelect")

const ctx=document.getElementById("chart").getContext("2d")

function pad(n){
return n.toString().padStart(2,"0")
}


/* LOAD DATA */

async function loadData(start,end){

const res = await fetch(`/api/data?start=${start}&end=${end}`)
jsonData = await res.json()

processData()

}


/* AGGREGATE */

function aggregateData(data,type){

let buckets={}

data.forEach(e=>{

const d=new Date(e.created_at)

let key

if(type==="hour"){
key=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:00`
}

if(type==="3hour"){

const h=Math.floor(d.getHours()/3)*3
key=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(h)}:00`

}

if(!buckets[key]) buckets[key]=[]

buckets[key].push(Number(e.value))

})

let result=[]

Object.keys(buckets).forEach(k=>{

const vals=buckets[k]

const avg=vals.reduce((a,b)=>a+b)/vals.length

result.push({
time:k,
value:avg
})

})

result.sort((a,b)=>new Date(a.time)-new Date(b.time))

return result

}


/* PROCESS */

function processData(){

const range=rangeSelect.value

let graphData

if(range==="day"){
graphData=jsonData
}

if(range==="week"){
graphData=aggregateData(jsonData,"hour")
}

if(range==="month"){
graphData=aggregateData(jsonData,"3hour")
}

displayChart(graphData)

}


/* CHART */

function displayChart(data){

const labels=[]
const values=[]

data.forEach(e=>{

let d

if(e.created_at){
d=new Date(e.created_at)
}else{
d=new Date(e.time)
}

labels.push(`${pad(d.getHours())}:${pad(d.getMinutes())}`)
values.push(Number(e.value))

})

if(chart) chart.destroy()

chart=new Chart(ctx,{
type:"line",
data:{
labels:labels,
datasets:[{
label:"Pollution",
data:values,
borderColor:"#007bff",
tension:0.3
}]
}
})

}


/* FILTER */

function applyFilter(){

const date=dateInput.value
const range=rangeSelect.value

const start=new Date(date)
let end=new Date(date)

if(range==="day") end.setDate(start.getDate()+1)
if(range==="week") end.setDate(start.getDate()+7)
if(range==="month") end.setMonth(start.getMonth()+1)

loadData(start.toISOString(),end.toISOString())

}


dateInput.addEventListener("change",applyFilter)
rangeSelect.addEventListener("change",applyFilter)

dateInput.value=new Date().toISOString().slice(0,10)

applyFilter()