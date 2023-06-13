import {join} from "https://deno.land/std@0.191.0/path/mod.ts"
import {parse} from "https://deno.land/std@0.191.0/csv/mod.ts"
import * as log from "https://deno.land/std@0.191.0/log/mod.ts"
import * as _ from "https://deno.land/x/lodash@4.17.19/lodash.js"
interface Launch{
    flightNumber:number,
    mission:string,
    rocket:string,
    customers:string[],

}
export const launches=new Map<number,Launch>()
async function readFile(){
    const path=join("models","planets.csv")
    const palnetFile=await Deno.readTextFile(path)
    const planetdata=await parse( palnetFile,{
        comment:"#",
        skipFirstRow: true,
    })
    return planetdata
}
const newEart=await readFile()
const Planets=newEart.filter(planet=>{
    const {koi_disposition,koi_prad,koi_smass,koi_srad}=planet
    if(!koi_prad||!koi_smass||!koi_srad)return
    const planetRadius=parseFloat(koi_prad)
    const planetTemp=parseFloat(koi_smass)
    const planetSolar=parseFloat(koi_srad)
    return koi_disposition==="CONFIRMED"
    && planetRadius>0.5
    && planetRadius<1.5
    &&planetTemp> 0.78
    &&planetTemp< 1.04
    &&planetSolar>0.99
    &&planetSolar<1.01
})
export const planetsData=Planets.map(planet=>{
    const {koi_prad,koi_smass,koi_srad,kepler_name,koi_steff,koi_count}=planet
    return{
        kepler_name,
        koi_prad,
        koi_smass,
        koi_srad,
        koi_steff,
        koi_count
    }
})
export async function dowenloadLaunchdata(){
    log.info("Dowenload launche data")
    const response=await fetch('https://api.spacexdata.com/v3/launches',{method:"GET"})
    if(!response.ok){
        log.warning('we get some Plroblem')
    }
    const launcheData=await response.json()
    for(const launc of launcheData){
        const {flight_number,mission_name,rocket,}=launc
        const {rocket_name,second_stage}=rocket
        const {payloads}=second_stage
        const [data]=payloads
        const flightData={
            flightNumber:flight_number,
            mission:mission_name,
            rocket: rocket_name,
            customers:data.customers
        }
        launches.set(flight_number,flightData)
        console.log(data.customers)
    }
}
if(import.meta.main){
    await dowenloadLaunchdata()
    log.info(JSON.stringify(import.meta))
    log.info(`Dowenload data for ${launches.size} SpaceX launches`)
} 