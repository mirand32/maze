// module aliases
const {
    Engine,
    Render,
    World,
    Bodies,
    Runner,
    Body,
    Events
    } = Matter
// create an engine
const engine = Engine.create();
const {world} = engine
engine.world.gravity.y = 0;


const windowWidth = window.innerWidth || document.documentElement.clientWidth ||
    document.body.clientWidth;
const windowHeight = window.innerHeight || document.documentElement.clientHeight ||
    document.body.clientHeight;

// const windowWidth=800
// const windowHeight=600
const rows=10;
const columns=15;
const unitLength=windowWidth/columns
const unitHeight=windowHeight/rows

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
        Bodies.rectangle(windowWidth/2,0,windowWidth,1,{isStatic:true}),
        Bodies.rectangle(windowWidth/2,windowHeight,windowWidth,1,{isStatic:true}),
        Bodies.rectangle(0,windowHeight/2,1,windowHeight,{isStatic:true}),
        Bodies.rectangle(windowWidth,windowHeight/2,1,windowHeight,{isStatic:true})
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

verticals.forEach((col,colIdx)=>{
    col.forEach((open,rowIdx=0)=>{
        if(!open){
            const wall=Bodies.rectangle(
                unitLength*(colIdx+1),
                (unitHeight/2)+(unitHeight*rowIdx),
                2,
                unitHeight,
                {
                    isStatic:true,
                    label:"wall"
                }
                )
                World.add(world, wall);
            }
            rowIdx+=1
        })
        colIdx+=1
    })
    
    horizantals.forEach((row,rowIdx=1)=>{
        row.forEach((open,colIdx=0)=>{
            if(!open){
                const wall=Bodies.rectangle(
                    (unitLength/2)+(unitLength*colIdx),
                    unitHeight*(rowIdx+1),
                unitLength,
                2,
                {
                    isStatic:true,
                    label:"wall"
                }
                )
                World.add(world, wall);
            }
        colIdx+=1
    })
    rowIdx+=1
})

const goal= Bodies.rectangle(
    windowWidth - (unitLength/2),
    windowHeight - (unitHeight/2),
    unitLength * .7,
    unitHeight * .7,
    {
        isStatic:true,
    }

)

World.add(world,goal)

const ball = Bodies.circle(
    unitLength / 2,
    unitHeight / 2,
    unitLength / 4,
    {
        isStatic:false,
    }
)

World.add(world, ball)

function checkMovement(e){
    const{x,y}=ball.velocity
    if(e.keyCode===83){
        Body.setVelocity(ball,{x:x,y:y+5})
    } 
    else if(e.keyCode===87){
        Body.setVelocity(ball,{x:x,y:y-5})
    } 
    else if(e.keyCode===68){
        Body.setVelocity(ball,{x:x+5,y:y})
    }  
    else if(e.keyCode===65){
        Body.setVelocity(ball,{x:x-5,y:y})
    }
}

const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

document.addEventListener("keydown", throttle(checkMovement,100))

Events.on(engine, "collisionStart", event =>{
    event.pairs.forEach(collision=>{
        if(collision.bodyA===goal||collision.bodyB===goal){
            winAnimation()
        }
    })
})

function winAnimation(){
    engine.world.gravity.y = 1;
    world.bodies.forEach(body=>{
        if(body.label==="wall"){
            Body.setStatic(body,false)
        }
    })
}