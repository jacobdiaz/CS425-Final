let program;
let gl;
let carousel;
let wheel;
let sign;

// values for sliders
let wheelSpeed = 1;
let trainSpeed = 1;
let carouselSpeed = 1;
let image = 1;
let imageString = "afirm1";
// Set the original image to spongebob and image index to 1

// Camera variables
let eye = vec4(20.0, 2.0, 15.0);
let originalEye = vec4(30.0, 2.0, 15.0);
let cameraXform = mat4();
let lookEYE = vec3(-16, 5.5, 8);
let lookAT = vec3(8, 0, 3);
let lookUP = vec3(0, 1, 0);
let viewXform;

window.onload = init = () => {
  // Configure WebGL
  configureWebGl();

  // UI elements
  webglLessonsUI.setupSlider("#wheelSpeed", { value: 1, slide: updateWheelSpeed, min: -1.0, max: 6.0 });
  webglLessonsUI.setupSlider("#trainSpeed", { value: 1, slide: updateTrainSpeed, min: -1.0, max: 6.0 });
  webglLessonsUI.setupSlider("#carouselSpeed", { value: 1, slide: updateCarouselSpeed, min: -1.0, max: 6.0 });
  webglLessonsUI.setupSlider("#image", { value: 1, slide: updateImage, min: 1.0, max: 4.0 });

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // projection matrix using perspective
  let projection = perspective(50, aspectRatio, 0.5, 100.0);
  let uProjectionLoc = gl.getUniformLocation(program, "uProjection");
  gl.uniformMatrix4fv(uProjectionLoc, false, flatten(projection));

  // normal transform matrix
  let normalTransformation = mat3();
  let vNormalTransformation = gl.getUniformLocation(program, "vNormalTransformation");
  gl.uniformMatrix3fv(vNormalTransformation, false, flatten(normalTransformation));

  // Instantiate new componentes
  ground = new Ground(gl, program);
  train = new Train(gl, program);
  carousel = new Carousel(gl, program);
  wheel = new Wheel(gl, program);

  // Render those bad boys
  render();
};

let time = 0;
var shine;

function render() {
  // Setup a ui.

  // #region Camera
  // Create viewXform using lookAt( eye, eye+at, up ) and push it to the GPU
  viewXform = lookAt(lookEYE, add(lookEYE, lookAT), lookUP);
  viewXform = mult(cameraXform, viewXform); // Modify the camera view model matrix as we move around with user input
  let uViewXform = gl.getUniformLocation(program, "uViewXform");
  gl.uniformMatrix4fv(uViewXform, false, flatten(viewXform));
  //#endregion

  // Grab our uniforms
  let uModelXformLoc = gl.getUniformLocation(program, "uModelXform");
  let uLightPositionLoc = gl.getUniformLocation(program, "uLightPosition");
  let uNormalMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");

  let lightXform = mat4();
  lightXform = mult(translate(7.0, 3.5, 6.0), scalem(0.25, 0.25, 0.25));
  var lightPosition = vec3(mult(lightXform, vec4(0.0, 0.0, 0.0, 1)));

  gl.uniform3fv(uLightPositionLoc, flatten(lightPosition));

  gl.uniformMatrix4fv(uModelXformLoc, false, flatten(lightXform));

  gl.uniformMatrix4fv(uModelXformLoc, false, flatten(lightXform));

  gl.uniformMatrix3fv(uNormalMatrixLoc, false, flatten(calcNormalMatrix(viewXform, lightXform)));

  time += 1;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  sign = new Sign(gl, program, imageString);

  // Render all the components
  sign.render();
  ground.render([12, -3, 12]);
  train.render(time, [0, -4, 22], trainSpeed);
  wheel.render(time, [10, 8, 12], wheelSpeed);
  carousel.render(time, [8, -2, 20], carouselSpeed);

  let uShininessLoc = gl.getUniformLocation(program, "uShininess");
  gl.uniform1f(uShininessLoc, shine);

  requestAnimFrame(render);
}

// Handles the UI sliders
function updateWheelSpeed(event, ui) {
  wheelSpeed = ui.value;
}
function updateTrainSpeed(event, ui) {
  trainSpeed = ui.value;
}
function updateCarouselSpeed(event, ui) {
  carouselSpeed = ui.value;
}
function updateImage(event, ui) {
  input = ui.value;
  switch (input) {
    case 1:
      imageString = "afirm1";
      break;
    case 2:
      imageString = "afirm2";
      break;
    case 3:
      imageString = "afirm3";
      break;
    case 4:
      imageString = "afirm4";
      break;
  }
}

function calcNormalMatrix(viewXform, modelXform) {
  var modelView = mult(viewXform, modelXform);
  var N = mat3();
  for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) N[i][j] = modelView[i][j];
  return transpose(inverse3(N));
}

function moveCamera(event) {
  switch (event.key) {
    case "a":
    case "A":
      var newXform = mat4();
      newXform = rotateY(-0.02);
      cameraXform = mult(newXform, cameraXform);
      var direction = vec3(Math.cos(radians(-2)), 0, Math.sin(radians(-2)));
      lookAT = add(direction, lookAT);
      break;
    case "s":
    case "S":
      lookEYE = subtract(lookEYE, mult(vec3(0.1, 0, 0.1), lookAT));
      break;
    case "d":
    case "D":
      var newXform = mat4();
      newXform = rotateY(0.02);
      cameraXform = mult(newXform, cameraXform);
      var direction = vec3(Math.cos(radians(2)), 0, Math.sin(radians(2)));
      lookAT = subtract(lookAT, direction);
      break;
    case "w":
    case "W":
      lookEYE = add(lookEYE, mult(vec3(0.1, 0, 0.1), lookAT));
      break;
  }
}

function configureWebGl() {
  document.addEventListener("keydown", moveCamera, false);
  let canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);

  !gl ? alert("WebGL isn't available") : null;

  gl.viewport(0, 0, canvas.width, canvas.height);
  aspectRatio = canvas.width / canvas.height;
  gl.clearColor(0.2, 0.6, 0.8, 1.0);

  // Load the shaders, create a GLSL program, and use it.
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);
}
