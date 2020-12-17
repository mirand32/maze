// module aliases
const {
    Engine,
    Render,
    World,
    Bodies,
    Runner
    } = Matter
// create an engine
const engine = Engine.create();
const {world} = engine

// const windowWidth = window.innerWidth || document.documentElement.clientWidth ||
//     document.body.clientWidth;
// const windowHeight = window.innerHeight || document.documentElement.clientHeight ||
//     document.body.clientHeight;

const windowWidth=800
const windowHeight=600

// create a renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options:{
        wireframes:true,
        width:windowWidth,
        height:windowHeight
    }
});
Render.run(render)
Runner.run(Runner.create(), engine)

// Walls
const walls=[
    Bodies.rectangle(windowWidth/2,0,windowWidth,20,{isStatic:true}),
    Bodies.rectangle(windowWidth/2,windowHeight,windowWidth,20,{isStatic:true}),
    Bodies.rectangle(0,windowHeight/2,20,windowHeight,{isStatic:true}),
    Bodies.rectangle(windowWidth,windowHeight/2,20,windowHeight,{isStatic:true})
]

World.add(world,walls)

const generateCoords=(primAx,secAx,axisArr)=>{
    Array(primAx)
        .fill(null).map(()=>{
            axisArr.push(Array(secAx)
            .fill(false))
        })
}
let verticals=[]
let horizantals=[]
let squares=[]

const columns=3;
const rows=4;

generateCoords(rows-1,columns,horizantals)
generateCoords(columns-1,rows,verticals)
generateCoords(rows,columns,squares)

console.log("h",horizantals)
console.log("v",verticals)
console.log("s",squares)
class Path {
    constructor(data){
        this.xLimit=10,
        this.yLimit=10,
        this.x,
        this.y,
        this.data=data
    }
    generateXY=()=>{
        if(Math.random()>0.5){
            setX()
        }
        else{
            setY()
        }
    }
    setX=()=>{
        if(setX){

        }
    }


}