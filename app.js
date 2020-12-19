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
const rows=10;
const columns=16;
const unitLength=(windowWidth-20)/columns
const unitHeight=(windowHeight-20)/rows

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

generateCoords(rows-1,columns,horizantals)
generateCoords(columns-1,rows,verticals)
generateCoords(rows,columns,grid)

const startRow=Math.floor(Math.random()*rows)
const startCol=Math.floor(Math.random()*columns)

let totalCoords=columns*rows
const path=[[startRow,startCol]]
let currPath

const pathHandler =(row,col)=>{
    console.log(row,col)
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
        const removeWall = (dir === "left") ? col - 1 : col;
        verticals[removeWall][row] = true;
        } else {
        const removeWall = (dir === "up") ? row - 1 : row;
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

let c=1
verticals.forEach(row=>{
    let r=0
    row.forEach((open)=>{
        if(!open){
            const x=(unitLength*c)+10 
            const y=(unitHeight/2)+(unitHeight*r)+10
            const wall=Bodies.rectangle(x,y,1,unitHeight,{isStatic:true})
            World.add(world, wall);
        }
        r+=1
    })
    c+=1
})

let r=1
horizantals.forEach(col=>{
    let c=0
    col.forEach((open)=>{
        if(!open){
            const x=(unitLength/2)+(unitLength*c)+10 
            const y=(unitHeight*r)+10
            const wall=Bodies.rectangle(x,y,unitLength,1,{isStatic:true})
            World.add(world, wall);
        }
        c+=1
    })
    r+=1
})

console.log(verticals)
// let c=0
// horizantals.forEach(row=>{
//     let r=0
//     row.forEach(open=>{
//         if(!open){
//             const x=(unitLength/2)+(unitLength*c)+10 
//             const y=(unitHeight*r)+10 
//             const wall=Bodies.rectangle(x,y,unitLength,1,{isStatic:true})
//             World.add(world, wall);
//         }
//         r+=1 
//     })
//     c+=1
// })