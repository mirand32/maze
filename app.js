// ---SETUP ENVIRONMENT---

// module aliases
const { Engine, Render, World, Bodies, Runner, Body, Events} = Matter

// create engine and world
const engine = Engine.create();
const {world} = engine
engine.world.gravity.y = 0;

// Set width, height, rows and colums
const windowWidth = window.innerWidth || document.documentElement.clientWidth ||
    document.body.clientWidth;
const windowHeight = window.innerHeight || document.documentElement.clientHeight ||
    document.body.clientHeight;
const rows=10;
const columns=9;
const unitLength=windowWidth/columns
const unitHeight=windowHeight/rows

// create renderer and run it
const render = Render.create({
    element: document.body,
    engine: engine,
    options:{
        wireframes:false,
        width:windowWidth,
        height:windowHeight
    }
});
Render.run(render)
Runner.run(Runner.create(), engine)

// Create border for game to keep all Bodies inside canvas
    const walls=[
        Bodies.rectangle(windowWidth/2,0,windowWidth,1,{isStatic:true}),
        Bodies.rectangle(windowWidth/2,windowHeight,windowWidth,1,{isStatic:true}),
        Bodies.rectangle(0,windowHeight/2,1,windowHeight,{isStatic:true}),
        Bodies.rectangle(windowWidth,windowHeight/2,1,windowHeight,{isStatic:true})
    ]
    World.add(world,walls)

// ----CREATE MAZE-----

//generate 2d arrays with boolean values repersenting coords 
const generateCoords=(primAx,secAx,axisArr)=>{
    Array(primAx)
    .fill(null).map(()=>{
        axisArr.push(Array(secAx)
        .fill(false))
    })
}

// generate 2d array for vertical walls
let verticals=[]
generateCoords(columns-1,rows,verticals)
// generate 2d array for horizantal walls
let horizantals=[]
generateCoords(rows-1,columns,horizantals)
// generate grid array for if square has been visited
let grid=[]
generateCoords(rows,columns,grid)

// generate rand starting point
const startRow=Math.floor(Math.random()*rows)
const startCol=Math.floor(Math.random()*columns)
// add starting point to first position on path
const path=[[startRow,startCol]]
let currPath
// calc total squares to be used to check if path is complete
let totalCoords=columns*rows
// function for shuffling array
function shuffle(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

// Draw path
const drawPath =(row,col)=>{
    // mark square as visited
    grid[row][col]=true
    // exit function if all squares are visited
    if (path.length===totalCoords){
        return
    }
    // get list of neighbour squares
    const neighbours = shuffle([
        [row, col + 1,"right"],
        [row, col - 1,"left"],
        [row + 1, col,"down"],
        [row - 1, col, "up"]
    ])
    // Find neighbour that is not out of bounds and hasnt already been visited
    const nextSquare=neighbours.find(([x,y])=>{
        if (x >= rows || x < 0 || y >= columns || y < 0){
            return false
        }
        return !grid[x][y]   
    })
    
    // removes horizantal or vertical wall between current position and next position
    const updateWalls=(dir)=>{
        // if moving left or right remove vertical wall
        if (dir === "left" || dir === "right") {
            const removeWall = (dir === "left") ? col - 1 : col;
            verticals[removeWall][row] = true;
        // if moving up or down remove horizantal wall
        } else {
        const removeWall = (dir === "up") ? row - 1 : row;
        horizantals[removeWall][col] = true;
        }
    }

    // if their is a valid neigbour to move too 
    if(nextSquare){
        const [nextRow, nextCol, direction] = nextSquare;
        // remove wall
        updateWalls(direction)
        // update current path and temp path
        path.push([nextRow,nextCol])
        currPath=path.slice()
        drawPath(nextRow,nextCol)
    }
    // if no valid neighbour check prev square for valid neighbour
    else{
        // remove current square from temp path
        currPath.pop()
        // try again to find valid neighbour for prev square
        const [x,y]=currPath[currPath.length - 1]
        drawPath(x,y)
    }
}
// create path
drawPath(startRow,startCol)
// iterate through verticals array and draw the vertical walls
verticals.forEach((col,colIdx)=>{
    col.forEach((open,rowIdx=0)=>{
        if(!open){
            const wall = Bodies.rectangle(
              unitLength * (colIdx + 1),
              unitHeight / 2 + unitHeight * rowIdx,
              2,
              unitHeight,
              {
                isStatic: true,
                label: "wall",
                render: {
                  fillStyle: "red",
                },
              }
            );
            World.add(world, wall);
        }
        rowIdx+=1
    })
    colIdx+=1
})
// draw horizantal walls
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
                    label:"wall",
                    render:{
                        fillStyle:"red"
                    }
                }
            )
            World.add(world, wall);
        }
        colIdx+=1
    })
    rowIdx+=1
})
// Create goal in bottom right of window
const goal = Bodies.rectangle(
  windowWidth - unitLength / 2,
  windowHeight - unitHeight / 2,
  unitLength * 0.7,
  unitHeight * 0.7,
  {
    isStatic: true,
    render: {
      fillStyle: "green",
    },
  }
);
World.add(world,goal)

// Create ball
const ball = Bodies.circle(unitLength / 2, unitHeight / 2, (unitLength + unitHeight) / 8, {
  isStatic: false
});
World.add(world, ball)

// Handle wasd or arrow keys to change velocity of ball
function checkMovement(e){
    console.log(e.keyCode)
    const{x,y}=ball.velocity
    if(e.keyCode===83||e.keyCode===40){
        Body.setVelocity(ball,{x:x,y:y+5})
    } 
    else if(e.keyCode===87||e.keyCode===38){
        Body.setVelocity(ball,{x:x,y:y-5})
    } 
    else if(e.keyCode===68||e.keyCode===39){
        Body.setVelocity(ball,{x:x+5,y:y})
    }  
    else if(e.keyCode===65||e.keyCode===37){
        Body.setVelocity(ball,{x:x-5,y:y})
    }
}
// Throttle function to prevent the ball from moving too fast
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
// Listen for keys to move ball
document.addEventListener("keydown", throttle(checkMovement,100))
// Check if ball reaches goal
Events.on(engine, "collisionStart", event =>{
    event.pairs.forEach(collision=>{
        // If ball touches goal display win
        if(collision.bodyA===goal||collision.bodyB===goal){
            winAnimation()
        }
    })
})

// animate on win condition
function winAnimation(){
    engine.world.gravity.y = 1;
    world.bodies.forEach(body=>{
        if(body.label==="wall"){
            Body.setStatic(body,false)
        }
    })
    document.querySelector(".winner").classList.remove("hidden")
}