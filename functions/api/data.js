export async function onRequest(context) {

const url = new URL(context.request.url)

const start = url.searchParams.get("start")
const end = url.searchParams.get("end")

let api =
"https://io.adafruit.com/api/v2/CyCPollutionMonitor/feeds/testfeed/data"

if(start && end){

api += `?start_time=${start}&end_time=${end}&limit=1000`

}

const response = await fetch(api)

const data = await response.json()

return new Response(JSON.stringify(data), {
headers: {
"Content-Type": "application/json",
"Access-Control-Allow-Origin": "*"
}
})

}