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
let grid=[]

const rows=3;
const columns=4;

generateCoords(rows-1,columns,horizantals)
generateCoords(columns-1,rows,verticals)
generateCoords(rows,columns,grid)

const startRow=Math.floor(Math.random()*rows)
const startCol=Math.floor(Math.random()*columns)

let totalCoords=columns*rows
const path=[[startRow,startCol]]
let currPath

const pathHandler =(row,col)=>{
    grid[row][col]=true
    if (path.length===totalCoords){
        return
    }
    // get rand list of valid neighbours
    const neighbours = [
        [row, col + 1,"right"],
        [row, col - 1,"left"],
        [row + 1, col,"down"],
        [row - 1, col, "up"]
    ]

    shuffleArray(neighbours)
    
    const newCoords=neighbours.find(([x,y])=>{
        if (x >= rows || x < 0 || y >= columns || y < 0){
            return false
        }
        return !grid[x][y]   
    })
    
    const updateWalls=(dir)=>{
        if (dir === "left" || dir === "right") {
        const removeWall = dir === "left" ? col - 1 : col;
        verticals[row][removeWall] = true;
        } else {
        const removeWall = dir === "up" ? row - 1 : row;
        horizantals[removeWall][col] = true;
        }
    }

    if(newCoords){
        updateWalls(newCoords[2])
        const [x,y]=newCoords
        path.push([x,y])
        currPath=path.slice()
        pathHandler(x,y)
    }
    else{
        currPath.pop()
        const [x,y]=currPath[currPath.length - 1]
        pathHandler(x,y)
    }
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

pathHandler(startRow,startCol)